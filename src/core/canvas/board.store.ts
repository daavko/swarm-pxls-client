import { useBoardInitEventBus, useBoardResetEventBus, usePixelEventBus } from '@/core/canvas/event-buses.ts';
import { defineStore } from 'pinia';
import { shallowRef, triggerRef } from 'vue';

interface BoardView {
    imageData: ImageData;
    uint32View: Uint32Array;
}

export const useBoardStore = defineStore('canvas-board', () => {
    const boardInitEventBus = useBoardInitEventBus();
    const pixelEventBus = usePixelEventBus();
    const boardResetEventBus = useBoardResetEventBus();

    const board = shallowRef<BoardView | null>(null);

    boardInitEventBus.on(({ board: { width, height, data } }) => {
        board.value = {
            imageData: new ImageData(width, height),
            uint32View: new Uint32Array(data.buffer),
        };
        board.value.imageData.data.set(data);
    });

    pixelEventBus.on(({ x, y, colorRawRgba }) => {
        if (!board.value) {
            return;
        }

        const pixelIndex = y * board.value.imageData.width + x;
        board.value.uint32View[pixelIndex] = colorRawRgba;
        triggerRef(board);
    });

    boardResetEventBus.on(() => {
        board.value = null;
    });

    return { board };
});
