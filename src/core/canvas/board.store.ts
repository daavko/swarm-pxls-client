import { useBoardInitEventBus, useBoardResetEventBus, usePixelEventBus } from '@/core/canvas/event-buses.ts';
import { defineStore } from 'pinia';
import { shallowRef, triggerRef } from 'vue';

interface CachedBoard {
    imageData: ImageData;
    uint32View: Uint32Array;
}

export const useBoardStore = defineStore('canvas-board', () => {
    const canvasInitEventBus = useBoardInitEventBus();
    const pixelEventBus = usePixelEventBus();
    const canvasResetEventBus = useBoardResetEventBus();

    const board = shallowRef<CachedBoard | null>(null);

    canvasInitEventBus.on((data) => {
        board.value = {
            imageData: new ImageData(data.width, data.height),
            uint32View: new Uint32Array(data.data.buffer),
        };
        board.value.imageData.data.set(data.data);
    });

    pixelEventBus.on((pixel) => {
        if (board.value == null) {
            // shouldn't really happen, but who knows
            return;
        }

        board.value.uint32View[pixel.y * board.value.imageData.width + pixel.x] = pixel.colorRawRgba;
        triggerRef(board);
    });

    canvasResetEventBus.on(() => {
        board.value = null;
    });

    return { board };
});
