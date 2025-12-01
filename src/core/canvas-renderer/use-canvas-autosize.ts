import type { Size } from '@/utils/geometry.ts';
import { type MaybeComputedElementRef, useResizeObserver } from '@vueuse/core';
import { computed, type ComputedRef, type Ref, ref } from 'vue';

function platformSupportsDevicePixelContentBox(): boolean {
    const div = document.createElement('div');
    const observer = new ResizeObserver(() => {
        // don't need an actual implementation here
    });
    try {
        observer.observe(div, { box: 'device-pixel-content-box' });
        return true;
    } catch {
        return false;
    } finally {
        observer.disconnect();
    }
}

function useResizeObserverContentBox(
    canvas: MaybeComputedElementRef<HTMLCanvasElement | null | undefined>,
    widthRef: Ref<number>,
    heightRef: Ref<number>,
): void {
    const observerFn = (entries: readonly ResizeObserverEntry[]): void => {
        for (const entry of entries) {
            const dpr = window.devicePixelRatio;
            widthRef.value = Math.round(entry.contentRect.width * dpr);
            heightRef.value = Math.round(entry.contentRect.height * dpr);
        }
    };
    useResizeObserver(canvas, observerFn);
}

function useResizeObserverDevicePixelContentBox(
    canvas: MaybeComputedElementRef<HTMLCanvasElement | null | undefined>,
    widthRef: Ref<number>,
    heightRef: Ref<number>,
): void {
    const observerFn = (entries: readonly ResizeObserverEntry[]): void => {
        for (const entry of entries) {
            if (entry.devicePixelContentBoxSize[0]) {
                widthRef.value = entry.devicePixelContentBoxSize[0].inlineSize;
                heightRef.value = entry.devicePixelContentBoxSize[0].blockSize;
            }
        }
    };
    useResizeObserver(canvas, observerFn, { box: 'device-pixel-content-box' });
}

export function useCanvasAutosize(
    canvas: MaybeComputedElementRef<HTMLCanvasElement | null | undefined>,
): ComputedRef<Size> {
    const lastKnownWidth = ref(0);
    const lastKnownHeight = ref(0);
    const size = computed(() => ({
        width: lastKnownWidth.value,
        height: lastKnownHeight.value,
    }));

    if (platformSupportsDevicePixelContentBox()) {
        useResizeObserverDevicePixelContentBox(canvas, lastKnownWidth, lastKnownHeight);
    } else {
        useResizeObserverContentBox(canvas, lastKnownWidth, lastKnownHeight);
    }

    return size;
}
