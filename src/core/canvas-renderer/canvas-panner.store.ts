import { useCanvasPanScaleStorage } from '@/core/canvas-renderer/use-canvas-pan-scale-storage.ts';
import { useCanvasStore } from '@/core/canvas/canvas.store.ts';
import { useBoardInitEventBus, useBoardResetEventBus } from '@/core/canvas/event-buses.ts';
import type { Point } from '@/utils/geometry.ts';
import { useNumericRefWithBounds } from '@/utils/reactivity.ts';
import { defineStore } from 'pinia';
import { computed, readonly, shallowRef, watch } from 'vue';
import { clamp } from '@/utils/math.ts';

interface PointerCoordinates {
    boardPoint: Point;
    screenPoint: Point;
}

interface PointerData {
    pointerId: number;
    down: PointerCoordinates;
    current: PointerCoordinates;
}

interface DisabledPanMode {
    mode: 'none';
}

interface MousePanMode {
    mode: 'mouse';
    data: PointerData;
}

interface TouchPanMode {
    mode: 'touch';
    first: PointerData;
    second?: PointerData;
    startScale: number;
}

type PanMode = DisabledPanMode | MousePanMode | TouchPanMode;

function screenSpaceCoordsToBoardSpaceUnclamped(screenX: number, screenY: number): Point {
    const boardX = (screenX - board.x) / board.scale;
    const boardY = (screenY - board.y) / board.scale;
    return { x: boardX, y: boardY };
}

function screenSpaceCoordsToBoardSpace(screenX: number, screenY: number, floored = false): Point {
    const { x: boardX, y: boardY } = screenSpaceCoordsToBoardSpaceUnclamped(screenX, screenY);
    // const clampedX = Math.max(0, Math.min(boardX, board.width - 1));
    // const clampedY = Math.max(0, Math.min(boardY, board.height - 1));
    const clampedX = clamp(0, boardX, board.width - 1);
    const clampedY = clamp(0, boardY, board.height - 1);
    if (floored) {
        return { x: Math.floor(clampedX), y: Math.floor(clampedY) };
    } else {
        return { x: clampedX, y: clampedY };
    }
}

function boardSpaceCoordsToScreenSpace(boardX: number, boardY: number): Point {
    const screenX = (boardX - board.panX) / board.scale + board.canvas.width / 2;
    const screenY = (boardY - board.panY) / board.scale + board.canvas.height / 2;
    return { x: screenX, y: screenY };
}

function screenSpaceCoordIsOnBoard(screenX: number, screenY: number): boolean {
    const { x, y } = screenSpaceCoordsToBoardSpaceUnclamped(screenX, screenY);
    return x >= 0 && x < board.width && y >= 0 && y < board.height;
}

export const useCanvasPannerStore = defineStore('canvas-panner', () => {
    const canvasStore = useCanvasStore();
    const canvasPanScaleStorage = useCanvasPanScaleStorage();
    const boardInitEventBus = useBoardInitEventBus();
    const boardResetEventBus = useBoardResetEventBus();

    const canvasWidth = computed(() => canvasStore.info?.width);
    const canvasHeight = computed(() => canvasStore.info?.height);

    const x = useNumericRefWithBounds(canvasPanScaleStorage.value?.x ?? null, 0, canvasWidth);
    const y = useNumericRefWithBounds(canvasPanScaleStorage.value?.y ?? null, 0, canvasHeight);
    const scale = useNumericRefWithBounds(canvasPanScaleStorage.value?.scale ?? null, 0.5, 100);

    const pointerState = shallowRef<PanMode>({ mode: 'none' });

    watch([x, y, scale], ([newX, newY, newScale]) => {
        if (newX != null && newY != null && newScale != null) {
            canvasPanScaleStorage.value = { x: newX, y: newY, scale: newScale };
        }
    });

    boardInitEventBus.on(({ info: { width, height } }) => {
        if (x.value == null) {
            x.value = Math.floor(width / 2);
        }
        if (y.value == null) {
            y.value = Math.floor(height / 2);
        }
        if (scale.value == null) {
            scale.value = 1;
        }
    });

    boardResetEventBus.on(() => {
        x.value = null;
        y.value = null;
        scale.value = null;
        canvasPanScaleStorage.value = null;
        pointerState.value = { mode: 'none' };
    });

    function pointerDown(e: PointerEvent): void {
        if (pointerState.value.mode === 'mouse' && e.pointerId !== pointerState.value.data.pointerId) {
            return;
        }

        // todo: minPanDistanceBroken
        if (pointerState.value.mode === 'touch' && (e.pointerType !== 'touch' || pointerState.value.second != null)) {
            return;
        }
        // todo: impl
    }

    function pointerMove(e: PointerEvent): void {
        // todo: impl
    }

    function pointerUp(e: PointerEvent): void {
        // todo: impl
    }

    function forceX(newX: number): void {
        x.value = newX;
        pointerState.value = { mode: 'none' };
    }

    function forceY(newY: number): void {
        y.value = newY;
        pointerState.value = { mode: 'none' };
    }

    function forceScale(newScale: number): void {
        scale.value = newScale;
        if (pointerState.value.mode === 'touch') {
            pointerState.value = { mode: 'none' };
        }
    }

    return {
        x: readonly(x),
        y: readonly(y),
        scale: readonly(scale),
        pointerDown,
        pointerMove,
        pointerUp,
        forceX,
        forceY,
        forceScale,
    };
});
