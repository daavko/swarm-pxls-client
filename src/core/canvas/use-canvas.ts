import { apiFetch, type ApiResponse, binaryApiFetch } from '@/core/api-client/api-fetch.ts';
import { InfoResponse } from '@/core/api-client/schemas/info.ts';
import { useErrorLogger } from '@/core/logger/use-error-logger.ts';
import type { PixelMessage } from '@/core/socket-client/schemas/message-schemas.ts';
import {
    CANVAS_SOCKET_CONNECTED_BUS_KEY,
    CANVAS_SOCKET_DISCONNECTED_BUS_KEY,
    CANVAS_SOCKET_ERROR_BUS_KEY,
    CANVAS_SOCKET_MESSAGE_BUS_KEY,
    useCanvasSocket,
} from '@/core/socket-client/use-canvas-socket.ts';
import { type EventBusKey, useEventBus } from '@vueuse/core';
import { defineStore, storeToRefs } from 'pinia';
import { computed, readonly, ref, shallowRef } from 'vue';

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

export const CANVAS_RESET_BUS_KEY: EventBusKey<void> = Symbol('Canvas reset event bus');

const usePxlsCanvasInternal = defineStore('canvas-internal', () => {
    const state = ref<CanvasState>('beforeFirstConnect');
    const info = shallowRef<InfoResponse | null>(null);
    const boardData = shallowRef<ImageData | null>(null);

    return { state, info, boardData };
});

export const useCanvas = defineStore('canvas', () => {
    const errorLogger = useErrorLogger();
    const canvasSocket = useCanvasSocket();
    const canvasSocketMessageBus = useEventBus(CANVAS_SOCKET_MESSAGE_BUS_KEY);
    const canvasSocketErrorBus = useEventBus(CANVAS_SOCKET_ERROR_BUS_KEY);
    const canvasSocketConnectedBus = useEventBus(CANVAS_SOCKET_CONNECTED_BUS_KEY);
    const canvasSocketDisconnectedBus = useEventBus(CANVAS_SOCKET_DISCONNECTED_BUS_KEY);
    const canvasResetBus = useEventBus(CANVAS_RESET_BUS_KEY);

    const { state, info, boardData } = storeToRefs(usePxlsCanvasInternal());

    canvasSocketMessageBus.on(() => {
        if (state.value === 'running') {
        }
    });
    canvasSocketErrorBus.on(() => {
        if (state.value === 'running') {
            scheduleReconnect('reconnecting');
        }
    });
    canvasSocketDisconnectedBus.on(() => {
        if (state.value === 'running') {
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
                errorLogger.logError(event);
                connectedStop();
                disconnectedStop();
                resolve(false);
            });
        });
    }

    async function fetchInfo(): Promise<InfoResponse | null> {
        let infoResponse: ApiResponse<InfoResponse>;
        try {
            infoResponse = await apiFetch('/info', InfoResponse, { signal: AbortSignal.timeout(5000) });
        } catch (e) {
            errorLogger.logError(e);
            return null;
        }

        if (infoResponse.success) {
            return infoResponse.data;
        } else {
            errorLogger.logError(infoResponse.error);
            return null;
        }
    }

    async function fetchBoardData(): Promise<ArrayBuffer | null> {
        let boardDataResponse: ApiResponse<ArrayBuffer>;
        try {
            boardDataResponse = await binaryApiFetch('/boarddata', { signal: AbortSignal.timeout(5000) });
        } catch (e) {
            errorLogger.logError(e);
            return null;
        }

        if (boardDataResponse.success) {
            return boardDataResponse.data;
        } else {
            errorLogger.logError(boardDataResponse.error);
            return null;
        }
    }

    async function reconnect(): Promise<void> {
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
                canvasResetBus.emit();
            }
            info.value = infoResponse;
        }

        state.value = 'connectingToSocket';
        canvasSocket.open();
        const opened = await waitForSocket();
        if (!opened) {
            scheduleReconnect('socketConnectionError');
        }

        const bufferedPixels: PixelMessage[] = [];
        const pixelListenerStop = canvasSocketMessageBus.on((message) => {
            if (message.type === 'pixel') {
                bufferedPixels.push(message);
            }
        });

        state.value = 'fetchingBoardData';
        const boardArrayBuffer = await fetchBoardData();
        pixelListenerStop();
        if (boardArrayBuffer == null) {
            scheduleReconnect('boardDataFetchError');
            return;
        }

        if (canvasSocket.status.value !== 'OPEN') {
            // socket closed somewhere when we were fetching board data, try again
            scheduleReconnect('reconnecting');
            return;
        }

        const { width, height, palette } = info.value;

        if (boardArrayBuffer.byteLength !== width * height) {
            errorLogger.logError(
                new Error('Board data size does not match expected dimensions', {
                    cause: {
                        expectedSize: width * height,
                        actualSize: boardArrayBuffer.byteLength,
                    },
                }),
            );
            scheduleReconnect('boardDataFetchError');
            return;
        }

        const boardImageBuffer = new Uint32Array(boardArrayBuffer.byteLength);
        const boardBufferView = new Uint8Array(boardArrayBuffer);
        boardBufferView.forEach((colorIndex, pixelIndex) => {
            const color = palette[colorIndex];
            if (color) {
                boardImageBuffer[pixelIndex] = color.rawRgba;
            }
        });
        bufferedPixels.forEach(({ pixels }) => {
            pixels.forEach(({ x, y, color: colorIndex }) => {
                const color = palette[colorIndex];
                if (color) {
                    const pixelIndex = y * width + x;
                    boardImageBuffer[pixelIndex] = color.rawRgba;
                }
            });
        });
        boardData.value = new ImageData(new Uint8ClampedArray(boardImageBuffer.buffer), width, height);
        state.value = 'running';
    }

    function scheduleReconnect(stateToSet: CanvasState): void {
        state.value = stateToSet;
        setTimeout(() => {
            void reconnect();
        }, 1000);
    }

    function destroy(): void {
        canvasResetBus.emit();
        state.value = 'beforeFirstConnect';
        canvasSocket.close();
        info.value = null;
        boardData.value = null;
    }

    return {
        state: computed(() => readonly(state)),
        info: computed(() => readonly(info)),
        boardData: computed(() => readonly(boardData)),
        reconnect,
        destroy,
    };
});
