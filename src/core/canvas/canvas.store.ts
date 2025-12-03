import { useBoardInitEventBus, useBoardResetEventBus, usePixelEventBus } from '@/core/canvas/event-buses.ts';
import { useSelectedColorStorage } from '@/core/canvas/use-selected-color-storage.ts';
import { logDebugMessage } from '@/core/logger/debug-log.ts';
import { logError } from '@/core/logger/error-log.ts';
import type { ApiResponse } from '@/core/pxls-api/api-fetch.ts';
import { PxlsApi } from '@/core/pxls-api/pxls-api.ts';
import { InfoResponse } from '@/core/pxls-api/schemas/info.ts';
import type { PixelMessage } from '@/core/pxls-socket/schemas/message-schemas.ts';
import {
    usePxlsSocket,
    usePxlsSocketConnectedEventBus,
    usePxlsSocketErrorEventBus,
    usePxlsSocketMessageEventBus,
} from '@/core/pxls-socket/use-pxls-socket.ts';
import { queueMacrotask } from '@/utils/task.ts';
import { useInterval } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, type ComputedRef, type DeepReadonly, readonly, ref, shallowRef, watch } from 'vue';

type CanvasState =
    | 'beforeFirstConnect'
    | 'fetchingInfo'
    | 'fetchInfoError'
    | 'connectingToSocket'
    | 'socketConnectionError'
    | 'fetchingBoardData'
    | 'boardDataFetchError'
    | 'running'
    | 'reconnecting';

const RECONNECT_DELAY_MS = 5000;

// server sends pings every minute, so we use a very slightly longer timeout
const MESSAGE_TIMEOUT_MS = 65000;
const MESSAGE_TIMEOUT_CHECK_INTERVAL_MS = 1000;

const PING_INTERVAL_MS = 15000;

export const useCanvas = defineStore('canvas', () => {
    const canvasSocket = usePxlsSocket();
    const canvasSocketMessageBus = usePxlsSocketMessageEventBus();
    const canvasSocketErrorBus = usePxlsSocketErrorEventBus();
    const canvasSocketConnectedBus = usePxlsSocketConnectedEventBus();
    const canvasSocketDisconnectedBus = usePxlsSocketConnectedEventBus();
    const pixelEventBus = usePixelEventBus();
    const canvasInitEventBus = useBoardInitEventBus();
    const canvasResetEventBus = useBoardResetEventBus();
    const selectedColorStorage = useSelectedColorStorage();

    const state = ref<CanvasState>('beforeFirstConnect');
    const info = shallowRef<InfoResponse | null>(null);
    const selectedColorIndex = ref<number | null>(null);

    selectedColorIndex.value = selectedColorStorage.value;

    watch(selectedColorStorage, (value) => {
        if (selectedColorIndex.value !== value) {
            selectedColorIndex.value = value;
        }
    });

    let reconnectScheduled = false;
    let lastSeenMessageTimestamp: number | null = null;

    useInterval(MESSAGE_TIMEOUT_CHECK_INTERVAL_MS, {
        callback: () => {
            const now = Date.now();
            if (state.value === 'running' && lastSeenMessageTimestamp != null) {
                const timeSinceLastMessage = now - lastSeenMessageTimestamp;
                if (timeSinceLastMessage > MESSAGE_TIMEOUT_MS) {
                    logDebugMessage('Message timeout, reconnecting...');
                    scheduleReconnect('reconnecting');
                }
            }
        },
    });

    useInterval(PING_INTERVAL_MS, {
        callback: () => {
            if (state.value === 'running') {
                canvasSocket.send(JSON.stringify({ type: 'ping' }));
            }
        },
    });

    canvasSocketMessageBus.on((message) => {
        if (info.value == null || state.value !== 'running') {
            return;
        }

        if (message.type === 'pixel') {
            const { palette } = info.value;
            message.pixels.forEach(({ x, y, color: colorIndex }) => {
                const color = palette[colorIndex];
                if (color) {
                    pixelEventBus.emit({ x, y, colorIndex, colorRawRgba: color.rawRgba });
                }
            });
        }

        lastSeenMessageTimestamp = Date.now();
    });
    canvasSocketErrorBus.on(() => {
        if (state.value === 'running') {
            logDebugMessage('Canvas socket error');
            scheduleReconnect('reconnecting');
        }
    });
    canvasSocketDisconnectedBus.on(() => {
        if (state.value === 'running') {
            logDebugMessage('Canvas socket disconnected');
            scheduleReconnect('reconnecting');
        }
    });

    async function waitForSocket(): Promise<boolean> {
        return new Promise((resolve) => {
            const connectedStop = canvasSocketConnectedBus.once(() => {
                disconnectedStop();
                errorStop();
                resolve(true);
            });
            const disconnectedStop = canvasSocketDisconnectedBus.once(() => {
                connectedStop();
                errorStop();
                resolve(false);
            });
            const errorStop = canvasSocketErrorBus.once((event) => {
                logError(event);
                connectedStop();
                disconnectedStop();
                resolve(false);
            });
        });
    }

    async function fetchInfo(): Promise<InfoResponse | null> {
        let infoResponse: ApiResponse<InfoResponse>;
        try {
            infoResponse = await PxlsApi.fetchInfo();
        } catch (e) {
            logError(e);
            return null;
        }

        if (infoResponse.success) {
            return infoResponse.data;
        } else {
            logError(infoResponse.error);
            return null;
        }
    }

    async function fetchBoardData(): Promise<ArrayBuffer | null> {
        let boardDataResponse: ApiResponse<ArrayBuffer>;
        try {
            boardDataResponse = await PxlsApi.fetchBoardData();
        } catch (e) {
            logError(e);
            return null;
        }

        if (boardDataResponse.success) {
            return boardDataResponse.data;
        } else {
            logError(boardDataResponse.error);
            return null;
        }
    }

    async function reconnect(): Promise<void> {
        if (reconnectScheduled) {
            return;
        }

        if (state.value === 'running') {
            scheduleReconnect('reconnecting');
            return;
        }

        if (
            state.value === 'fetchingInfo' ||
            state.value === 'connectingToSocket' ||
            state.value === 'fetchingBoardData'
        ) {
            // already trying to connect
            logDebugMessage('Reconnect called but already connecting, ignoring');
            return;
        }

        state.value = 'fetchingInfo';
        const infoResponse = await fetchInfo();
        if (infoResponse == null) {
            scheduleReconnect('fetchInfoError');
            return;
        } else {
            if (
                info.value != null &&
                (infoResponse.canvasCode !== info.value.canvasCode ||
                    infoResponse.width !== info.value.width ||
                    infoResponse.height !== info.value.height)
            ) {
                canvasResetEventBus.emit();
            }
            info.value = infoResponse;
        }

        state.value = 'connectingToSocket';
        canvasSocket.open();
        const opened = await waitForSocket();
        if (!opened) {
            scheduleReconnect('socketConnectionError');
            return;
        }

        const bufferedPixels: PixelMessage[] = [];
        const pixelListenerStop = canvasSocketMessageBus.on((message) => {
            if (message.type === 'pixel') {
                bufferedPixels.push(message);
            }
        });

        state.value = 'fetchingBoardData';
        const boardDataBuffer = await fetchBoardData();
        pixelListenerStop();
        if (boardDataBuffer == null) {
            scheduleReconnect('boardDataFetchError');
            return;
        }

        if (canvasSocket.status.value !== 'OPEN') {
            // socket closed somewhere when we were fetching board data, try again
            scheduleReconnect('reconnecting');
            return;
        }

        const { width, height, palette } = info.value;

        if (boardDataBuffer.byteLength !== width * height) {
            logError(
                new Error('Board data size does not match expected dimensions', {
                    cause: {
                        expectedSize: width * height,
                        actualSize: boardDataBuffer.byteLength,
                    },
                }),
            );
            scheduleReconnect('boardDataFetchError');
            return;
        }

        const boardImageArray = new Uint32Array(boardDataBuffer.byteLength);
        const boardDataArray = new Uint8Array(boardDataBuffer);
        boardDataArray.forEach((colorIndex, pixelIndex) => {
            const color = palette[colorIndex];
            if (color) {
                boardImageArray[pixelIndex] = color.rawRgba;
            }
        });
        bufferedPixels.forEach(({ pixels }) => {
            pixels.forEach(({ x, y, color: colorIndex }) => {
                const color = palette[colorIndex];
                if (color) {
                    const pixelIndex = y * width + x;
                    boardImageArray[pixelIndex] = color.rawRgba;
                }
            });
        });
        const boardImageData = new ImageData(new Uint8ClampedArray(boardImageArray.buffer), width, height);
        canvasInitEventBus.emit(boardImageData);
        state.value = 'running';
    }

    function scheduleReconnect(stateToSet: CanvasState): void {
        if (reconnectScheduled) {
            return;
        }
        reconnectScheduled = true;
        state.value = stateToSet;
        canvasSocket.close();
        setTimeout(() => {
            reconnectScheduled = false;
            void reconnect();
        }, RECONNECT_DELAY_MS);
    }

    function scheduleImmediateReconnect(stateToSet: CanvasState): void {
        if (reconnectScheduled) {
            return;
        }
        reconnectScheduled = true;
        state.value = stateToSet;
        canvasSocket.close();
        queueMacrotask(() => {
            reconnectScheduled = false;
            void reconnect();
        });
    }

    function selectColor(index: number | null): void {
        selectedColorIndex.value = index;
        selectedColorStorage.value = index;
    }

    return {
        state: readonly(state),
        info: readonly(info),
        selectedColorIndex: readonly(selectedColorIndex),
        selectedColor: computed(() => {
            const infoValue = info.value;
            const colorIndex = selectedColorIndex.value;

            if (infoValue && colorIndex !== null) {
                const color = infoValue.palette[colorIndex];
                if (color) {
                    return readonly(color);
                }
            }
            return null;
        }),
        scheduleImmediateReconnect,
        selectColor,
    };
});

export function useTypeAssistedCanvasInfo(): ComputedRef<DeepReadonly<InfoResponse> | null> {
    const canvasStore = useCanvas();
    return computed(() => canvasStore.info);
}
