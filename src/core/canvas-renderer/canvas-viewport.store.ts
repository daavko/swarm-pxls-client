import { useCanvasPanScaleStorage } from '@/core/canvas-renderer/use-canvas-pan-scale-storage.ts';
import { useCanvasStore } from '@/core/canvas/canvas.store.ts';
import { useBoardInitEventBus, useBoardResetEventBus } from '@/core/canvas/event-buses.ts';
import type { Point, Size } from '@/utils/geometry.ts';
import { clamp } from '@/utils/math.ts';
import { useNumericRefWithBounds } from '@/utils/reactivity.ts';
import { watchThrottled } from '@vueuse/core';
import { defineStore, storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';

const MIN_SCALE = 0.5;
const MAX_SCALE = 100;

export const useCanvasViewportStore = defineStore('canvas-viewport', () => {
    const { size: canvasSize } = storeToRefs(useCanvasStore());
    const canvasPanScaleStorage = useCanvasPanScaleStorage();
    const boardInitEventBus = useBoardInitEventBus();
    const boardResetEventBus = useBoardResetEventBus();

    const pan = ref<Point | null>(canvasPanScaleStorage.value?.pan ?? null);
    const scale = useNumericRefWithBounds(canvasPanScaleStorage.value?.scale ?? null, MIN_SCALE, MAX_SCALE);
    const canScaleDown = computed((): boolean => {
        return scale.value != null && scale.value > MIN_SCALE;
    });
    const canScaleUp = computed((): boolean => {
        return scale.value != null && scale.value < MAX_SCALE;
    });

    const viewportSize = ref<Size | null>(null);
    const viewportOffset = computed((): Point | null => {
        if (!pan.value || scale.value == null || !viewportSize.value) {
            return null;
        } else {
            const { x: panX, y: panY } = pan.value;
            const { width, height } = viewportSize.value;
            return {
                x: width / 2 - panX * scale.value,
                y: height / 2 - panY * scale.value,
            };
        }
    });

    const mouseViewportCoords = ref<Point | null>(null);
    const mouseBoardCoords = computed((): Point | null => {
        if (!mouseViewportCoords.value) {
            return null;
        }

        return viewportCoordsToBoardCoords(mouseViewportCoords.value, true, true);
    });

    watch(
        [pan, canvasSize],
        ([newPan, newCanvasSize]) => {
            if (!newPan || !newCanvasSize) {
                return;
            }

            if (newPan.x < 0) {
                pan.value!.x = 0;
            } else if (newPan.x > newCanvasSize.width) {
                pan.value!.x = newCanvasSize.width;
            }

            if (newPan.y < 0) {
                pan.value!.y = 0;
            } else if (newPan.y > newCanvasSize.height) {
                pan.value!.y = newCanvasSize.height;
            }
        },
        { immediate: true, flush: 'sync', deep: true },
    );

    watchThrottled(
        [pan, scale],
        ([newPan, newScale]) => {
            if (newPan && newScale != null) {
                canvasPanScaleStorage.value = { pan: newPan, scale: newScale };
            }
        },
        { immediate: true, flush: 'post', deep: true, throttle: 500 },
    );

    boardInitEventBus.on(({ info: { width, height } }) => {
        pan.value ??= { x: Math.floor(width / 2), y: Math.floor(height / 2) };
        scale.value ??= 1;
    });

    boardResetEventBus.on(() => {
        pan.value = null;
        scale.value = null;
        canvasPanScaleStorage.value = null;
    });

    function viewportCoordsToBoardCoords(
        viewportCoords: Point,
        clampToBoard: boolean,
        floor: boolean,
        usedScale?: number,
    ): Point | null {
        const calculationScale = usedScale ?? scale.value;

        if (!viewportOffset.value || calculationScale == null) {
            return null;
        }

        const { x: offsetX, y: offsetY } = viewportOffset.value;
        let mouseX = (viewportCoords.x - offsetX) / calculationScale;
        let mouseY = (viewportCoords.y - offsetY) / calculationScale;

        if (floor) {
            mouseX = Math.floor(mouseX);
            mouseY = Math.floor(mouseY);
        }

        if (clampToBoard) {
            if (!canvasSize.value) {
                return null;
            }
            return {
                x: clamp(0, mouseX, canvasSize.value.width - 1),
                y: clamp(0, mouseY, canvasSize.value.height - 1),
            };
        } else {
            return { x: mouseX, y: mouseY };
        }
    }

    function updateMouseViewportCoords(viewportCoords: Point): void {
        if (mouseViewportCoords.value) {
            mouseViewportCoords.value.x = viewportCoords.x;
            mouseViewportCoords.value.y = viewportCoords.y;
        } else {
            mouseViewportCoords.value = {
                x: viewportCoords.x,
                y: viewportCoords.y,
            };
        }
    }

    return {
        pan,
        scale,
        canScaleDown,
        canScaleUp,
        viewportSize,
        viewportOffset,
        mouseViewportCoords,
        mouseBoardCoords,
        viewportCoordsToBoardCoords,
        updateMouseViewportCoords,
    };
});
