import {
    type PixelEvent,
    useBoardInitEventBus,
    useBoardResetEventBus,
    usePixelEventBus,
} from '@/core/canvas/event-buses.ts';
import { logError } from '@/core/logger/error-log.ts';
import type { ApiResponse, ApiSuccessResponse } from '@/core/pxls-api/api-fetch.ts';
import type { ApiRequestState } from '@/core/pxls-api/api-request-state.ts';
import { PxlsApi } from '@/core/pxls-api/pxls-api.ts';
import type { Size } from '@/utils/geometry.ts';
import { DateTime } from 'luxon';
import { defineStore } from 'pinia';
import { ref, shallowRef, triggerRef } from 'vue';

interface TimedPixelEvent extends PixelEvent {
    timestamp: number;
}

function timestampFromHeatmapValue(generationTimestamp: number, cooldown: number, value: number): number {
    const ageFraction = (255 - value) / 255;
    // age is in seconds
    const age = ageFraction * cooldown;
    return generationTimestamp + age;
}

export const useHeatmapStore = defineStore('canvas-heatmap', () => {
    const boardInitEventBus = useBoardInitEventBus();
    const pixelEventBus = usePixelEventBus();
    const boardResetEventBus = useBoardResetEventBus();

    const size = ref<Size | null>(null);
    const heatmap = shallowRef<Uint32Array | null>(null);
    const loadState = ref<ApiRequestState>('idle');
    const heatmapCooldown = ref<number | null>(null);

    boardInitEventBus.on(({ info }) => {
        size.value = { width: info.width, height: info.height };
        heatmap.value = null;
        loadState.value = 'idle';
        heatmapCooldown.value = info.heatmapCooldown;
    });

    pixelEventBus.on(({ x, y }) => {
        if (!size.value || !heatmap.value || loadState.value !== 'success') {
            return;
        }

        const pixelIndex = y * size.value.width + x;
        heatmap.value[pixelIndex] = 255;
        triggerRef(heatmap);
    });

    boardResetEventBus.on(() => {
        size.value = null;
        heatmap.value = null;
        loadState.value = 'idle';
    });

    async function fetchHeatmapData(): Promise<ApiSuccessResponse<ArrayBuffer> | null> {
        let heatmapDataResponse: ApiResponse<ArrayBuffer>;
        try {
            heatmapDataResponse = await PxlsApi.fetchHeatmapData();
        } catch (e) {
            logError(e);
            return null;
        }

        if (heatmapDataResponse.success) {
            return heatmapDataResponse;
        } else {
            logError(heatmapDataResponse.error);
            return null;
        }
    }

    async function loadHeatmap(): Promise<void> {
        if (
            !size.value ||
            heatmapCooldown.value == null ||
            loadState.value === 'loading' ||
            loadState.value === 'success'
        ) {
            return;
        }

        loadState.value = 'loading';

        const bufferedPixels: TimedPixelEvent[] = [];
        const pixelListenerStop = pixelEventBus.on((event) => {
            bufferedPixels.push({ ...event, timestamp: Math.round(Date.now() / 1000) });
        });
        const loadStartTime = Date.now();
        const heatmapResponse = await fetchHeatmapData();
        const loadEndTime = Date.now();
        pixelListenerStop();
        if (!heatmapResponse) {
            loadState.value = 'error';
            return;
        }
        if (heatmapResponse.data.byteLength !== size.value.width * size.value.height) {
            logError(
                new Error('Heatmap data size does not match board size', {
                    cause: {
                        expectedSize: size.value.width * size.value.height,
                        actualSize: heatmapResponse.data.byteLength,
                    },
                }),
            );
            loadState.value = 'error';
            return;
        }

        let heatmapGenerationTimestamp: number | undefined;
        const dateHeader = heatmapResponse.response.headers.get('Date');
        if (dateHeader != null) {
            const serverDateTime = DateTime.fromHTTP(dateHeader);
            if (serverDateTime.isValid) {
                heatmapGenerationTimestamp = serverDateTime.toMillis();
            }
        }

        if (heatmapGenerationTimestamp == null) {
            // fallback: assume heatmap was generated in the middle of the load time
            heatmapGenerationTimestamp = loadStartTime + (loadEndTime - loadStartTime) / 2;
        }
        heatmapGenerationTimestamp = Math.round(heatmapGenerationTimestamp / 1000);

        const cooldown = heatmapCooldown.value;
        const { width, height } = size.value;
        const heatmapDataView = new Uint8Array(heatmapResponse.data);
        const heatmapTimeData = new Uint32Array(width * height);
        heatmapDataView.forEach((value, index) => {
            heatmapTimeData[index] = timestampFromHeatmapValue(heatmapGenerationTimestamp, cooldown, value);
        });
        bufferedPixels.forEach(({ x, y, timestamp }) => {
            heatmapTimeData[y * width + x] = timestamp;
        });

        heatmap.value = heatmapTimeData;
        loadState.value = 'success';
    }

    return { heatmap, loadState, loadHeatmap };
});
