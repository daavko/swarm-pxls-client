import {
    type PixelEvent,
    useBoardInitEventBus,
    useBoardResetEventBus,
    usePixelEventBus,
} from '@/core/canvas/event-buses.ts';
import { logError } from '@/core/logger/error-log.ts';
import type { ApiResponse } from '@/core/pxls-api/api-fetch.ts';
import type { ApiRequestState } from '@/core/pxls-api/api-request-state.ts';
import { PxlsApi } from '@/core/pxls-api/pxls-api.ts';
import type { Size } from '@/utils/geometry.ts';
import { defineStore } from 'pinia';
import { ref, triggerRef } from 'vue';

export const useVirginmapStore = defineStore('canvas-virginmap', () => {
    const canvasInitEventBus = useBoardInitEventBus();
    const pixelEventBus = usePixelEventBus();
    const boardResetEventBus = useBoardResetEventBus();

    const size = ref<Size | null>(null);
    const virginmap = ref<Uint8Array | null>(null);
    const loadState = ref<ApiRequestState>('idle');

    canvasInitEventBus.on(({ info: { width, height } }) => {
        size.value = { width, height };
        virginmap.value = null;
        loadState.value = 'idle';
    });

    pixelEventBus.on(({ x, y }) => {
        if (size.value == null || virginmap.value == null || loadState.value !== 'success') {
            return;
        }

        const pixelIndex = y * size.value.width + x;
        virginmap.value[pixelIndex] = 1;
        triggerRef(virginmap);
    });

    boardResetEventBus.on(() => {
        size.value = null;
        virginmap.value = null;
        loadState.value = 'idle';
    });

    async function fetchVirginmapData(): Promise<ArrayBuffer | null> {
        let virginmapDataResponse: ApiResponse<ArrayBuffer>;
        try {
            virginmapDataResponse = await PxlsApi.fetchVirginmapData();
        } catch (e) {
            logError(e);
            return null;
        }

        if (virginmapDataResponse.success) {
            return virginmapDataResponse.data;
        } else {
            logError(virginmapDataResponse.error);
            return null;
        }
    }

    async function loadVirginmap(): Promise<void> {
        if (size.value == null || loadState.value === 'loading' || loadState.value === 'success') {
            return;
        }

        loadState.value = 'loading';

        const bufferedPixels: PixelEvent[] = [];
        const pixelListenerStop = pixelEventBus.on((event) => {
            bufferedPixels.push(event);
        });
        const virginmapBuffer = await fetchVirginmapData();
        pixelListenerStop();
        if (virginmapBuffer == null) {
            loadState.value = 'error';
            return;
        }
        if (virginmapBuffer.byteLength !== size.value.width * size.value.height) {
            logError(
                new Error('Virginmap data size does not match board size', {
                    cause: {
                        expectedSize: size.value.width * size.value.height,
                        actualSize: virginmapBuffer.byteLength,
                    },
                }),
            );
            loadState.value = 'error';
            return;
        }

        const { width, height } = size.value;
        const virginmapDataView = new Uint8Array(virginmapBuffer);
        const virginmapDataArray = new Uint8Array(width * height);
        virginmapDataView.forEach((value, index) => {
            virginmapDataArray[index] = value > 0 ? 255 : 0;
        });
        bufferedPixels.forEach(({ x, y }) => {
            virginmapDataArray[y * width + x] = 0;
        });

        virginmap.value = virginmapDataArray;
        loadState.value = 'success';
    }

    return { virginmap, loadState, loadVirginmap };
});
