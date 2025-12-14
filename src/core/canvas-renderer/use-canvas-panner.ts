import { useCanvasViewportStore } from '@/core/canvas-renderer/canvas-viewport.store.ts';
import { useBoardResetEventBus } from '@/core/canvas/event-buses.ts';
import { eventIsInappropriate } from '@/utils/event.ts';
import { type Point, pointDelta, pointsDistance, pointToDeviceCoords, sizeCenter } from '@/utils/geometry.ts';
import { useEventListener } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { readonly, type Ref, ref, type ShallowRef, shallowRef, type TemplateRef } from 'vue';

const MOVE_THRESHOLD_MOUSE = 5;
const MOVE_THRESHOLD_TOUCH = 10 * window.devicePixelRatio;
const WHEEL_LINE_SIZE = 20;
const WHEEL_PAGE_SIZE = 400;

interface PointerCoordinates {
    boardCoords: Point;
    viewportCoords: Point;
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
    moveThresholdPassed: boolean;
}

interface SingleTouchPanMode {
    mode: 'singleTouch';
    data: PointerData;
    moveThresholdPassed: boolean;
}

interface TwoTouchPanMode {
    mode: 'twoTouch';
    first: PointerData;
    second: PointerData;
    startScale: number;
}

type PanMode = DisabledPanMode | MousePanMode | SingleTouchPanMode | TwoTouchPanMode;

// function screenSpaceCoordsToBoardSpaceUnclamped(screenX: number, screenY: number): Point {
//     const boardX = (screenX - board.x) / board.scale;
//     const boardY = (screenY - board.y) / board.scale;
//     return { x: boardX, y: boardY };
// }
//
// function screenSpaceCoordsToBoardSpace(screenX: number, screenY: number, floored = false): Point {
//     const { x: boardX, y: boardY } = screenSpaceCoordsToBoardSpaceUnclamped(screenX, screenY);
//     // const clampedX = Math.max(0, Math.min(boardX, board.width - 1));
//     // const clampedY = Math.max(0, Math.min(boardY, board.height - 1));
//     const clampedX = clamp(0, boardX, board.width - 1);
//     const clampedY = clamp(0, boardY, board.height - 1);
//     if (floored) {
//         return { x: Math.floor(clampedX), y: Math.floor(clampedY) };
//     } else {
//         return { x: clampedX, y: clampedY };
//     }
// }
//
// function boardSpaceCoordsToScreenSpace(boardX: number, boardY: number): Point {
//     const screenX = (boardX - board.panX) / board.scale + board.canvas.width / 2;
//     const screenY = (boardY - board.panY) / board.scale + board.canvas.height / 2;
//     return { x: screenX, y: screenY };
// }
//
// function screenSpaceCoordIsOnBoard(screenX: number, screenY: number): boolean {
//     const { x, y } = screenSpaceCoordsToBoardSpaceUnclamped(screenX, screenY);
//     return x >= 0 && x < board.width && y >= 0 && y < board.height;
// }

interface UseCanvasPannerReturn {
    pointerState: Readonly<ShallowRef<PanMode>>;
    interactionLocked: Ref<boolean>;
}

export function useCanvasPanner(canvas: TemplateRef<HTMLCanvasElement>): UseCanvasPannerReturn {
    const boardResetEventBus = useBoardResetEventBus();
    const canvasViewportStore = useCanvasViewportStore();
    const { pan, scale, canScaleDown, canScaleUp } = storeToRefs(useCanvasViewportStore());

    const pointerState = shallowRef<PanMode>({ mode: 'none' });
    const interactionLocked = ref(false);
    const wheelDeltaBucket = ref(0);

    useEventListener(
        canvas,
        'pointerdown',
        (event) => {
            const viewportCoords = pointToDeviceCoords({ x: event.offsetX, y: event.offsetY });
            canvasViewportStore.updateMouseViewportCoords(viewportCoords);

            if (interactionLocked.value || eventIsInappropriate(event, true)) {
                return;
            }

            if (pointerState.value.mode === 'mouse' && (event.pointerType !== 'mouse' || event.button !== 0)) {
                return;
            }

            if (pointerState.value.mode === 'singleTouch' && event.pointerType !== 'touch') {
                return;
            }

            if (pointerState.value.mode === 'twoTouch') {
                return;
            }

            const boardCoords = canvasViewportStore.viewportCoordsToBoardCoords(viewportCoords, false, false);
            if (!boardCoords) {
                // board not ready
                return;
            }

            addPointer(event, viewportCoords, boardCoords);
        },
        { passive: true },
    );
    useEventListener(
        canvas,
        'pointermove',
        (event) => {
            const viewportCoords = pointToDeviceCoords({ x: event.offsetX, y: event.offsetY });
            canvasViewportStore.updateMouseViewportCoords(viewportCoords);

            if (interactionLocked.value || eventIsInappropriate(event, false)) {
                return;
            }

            if (pointerState.value.mode === 'none') {
                return;
            }

            if (
                (pointerState.value.mode === 'mouse' || pointerState.value.mode === 'singleTouch') &&
                pointerState.value.data.pointerId !== event.pointerId
            ) {
                return;
            }

            if (
                pointerState.value.mode === 'twoTouch' &&
                (pointerState.value.first.pointerId !== event.pointerId ||
                    pointerState.value.second.pointerId !== event.pointerId)
            ) {
                return;
            }

            const boardCoords = canvasViewportStore.viewportCoordsToBoardCoords(viewportCoords, false, false);
            if (!boardCoords) {
                // board not ready
                return;
            }

            pointerMove(event, viewportCoords, boardCoords);
        },
        { passive: true },
    );
    useEventListener(
        canvas,
        'pointerup',
        (event) => {
            const viewportCoords = pointToDeviceCoords({ x: event.offsetX, y: event.offsetY });
            canvasViewportStore.updateMouseViewportCoords(viewportCoords);
            removePointer(event);
        },
        { passive: true },
    );
    useEventListener(
        canvas,
        'pointercancel',
        (event) => {
            removePointer(event);
        },
        { passive: true },
    );
    useEventListener(
        canvas,
        'wheel',
        (event) => {
            if (interactionLocked.value || eventIsInappropriate(event, true)) {
                return;
            }

            if (pointerState.value.mode === 'twoTouch') {
                return;
            }

            if (scale.value == null || !canvasViewportStore.viewportSize) {
                return;
            }

            const viewportCoords = pointToDeviceCoords({ x: event.offsetX, y: event.offsetY });
            canvasViewportStore.updateMouseViewportCoords(viewportCoords);

            let scrollDelta: number;
            switch (event.deltaMode) {
                case WheelEvent.DOM_DELTA_PIXEL:
                    scrollDelta = -event.deltaY;
                    break;
                case WheelEvent.DOM_DELTA_LINE:
                    scrollDelta = -event.deltaY * WHEEL_LINE_SIZE;
                    break;
                case WheelEvent.DOM_DELTA_PAGE:
                    scrollDelta = -event.deltaY * WHEEL_PAGE_SIZE;
                    break;
                default:
                    scrollDelta = -event.deltaY;
                    break;
            }

            const oldScale = scale.value;
            let newScale = scale.value * Math.exp(scrollDelta * 0.005);

            if ((newScale < oldScale && !canScaleDown.value) || (newScale > oldScale && !canScaleUp.value)) {
                return;
            }

            // todo: enable this only when a setting is enabled (requires actually finishing the settings UI)
            if (newScale > scale.value) {
                if (scale.value >= 1) {
                    newScale = Math.ceil(newScale);
                } else if (newScale > 1) {
                    newScale = 1;
                }
            } else {
                if (newScale >= 1) {
                    newScale = Math.floor(newScale);
                }
            }

            scale.value = newScale;
            if (scale.value !== newScale) {
                // we hit a limit
                newScale = scale.value;
            }

            const viewportCenter = sizeCenter(canvasViewportStore.viewportSize);
            const panDelta = pointDelta(viewportCoords, viewportCenter);
            if (pan.value) {
                pan.value = {
                    x: pan.value.x - panDelta.x / oldScale + panDelta.x / newScale,
                    y: pan.value.y - panDelta.y / oldScale + panDelta.y / newScale,
                };
            }
        },
        { passive: true },
    );

    function addPointer(event: PointerEvent, viewportCoords: Point, boardCoords: Point): void {
        const pointerData: PointerData = {
            pointerId: event.pointerId,
            down: { boardCoords, viewportCoords },
            current: { boardCoords, viewportCoords },
        };
        if (pointerState.value.mode === 'none') {
            if (event.pointerType === 'touch') {
                pointerState.value = {
                    mode: 'singleTouch',
                    data: pointerData,
                    moveThresholdPassed: false,
                };
            } else {
                pointerState.value = {
                    mode: 'mouse',
                    data: pointerData,
                    moveThresholdPassed: false,
                };
            }
            canvas.value?.setPointerCapture(event.pointerId);
        } else if (pointerState.value.mode === 'singleTouch' && event.pointerType === 'touch' && scale.value != null) {
            pointerState.value = {
                mode: 'twoTouch',
                first: pointerState.value.data,
                second: pointerData,
                startScale: scale.value,
            };
            canvas.value?.setPointerCapture(event.pointerId);
        }
    }

    function pointerMove(event: PointerEvent, viewportCoords: Point, boardCoords: Point): void {
        switch (pointerState.value.mode) {
            case 'mouse': {
                singlePointerMove(pointerState.value, viewportCoords, boardCoords, MOVE_THRESHOLD_MOUSE);
                break;
            }
            case 'singleTouch': {
                singlePointerMove(pointerState.value, viewportCoords, boardCoords, MOVE_THRESHOLD_TOUCH);
                break;
            }
            case 'twoTouch': {
                // todo
            }
        }
    }

    function singlePointerMove(
        panModeData: MousePanMode | SingleTouchPanMode,
        viewportCoords: Point,
        boardCoords: Point,
        moveThreshold: number,
    ): void {
        const delta = pointDelta(panModeData.data.current.viewportCoords, viewportCoords);
        panModeData.data.current = { boardCoords, viewportCoords };

        if (panModeData.moveThresholdPassed) {
            if (pan.value && scale.value != null) {
                pan.value.x -= delta.x / scale.value;
                pan.value.y -= delta.y / scale.value;
            }
        } else {
            const moveDistance = pointsDistance(panModeData.data.down.viewportCoords, viewportCoords);
            if (moveDistance >= moveThreshold) {
                panModeData.moveThresholdPassed = true;
            }
        }
    }

    function removePointer(event: PointerEvent): void {
        const pointerId = event.pointerId;
        if (
            (pointerState.value.mode === 'mouse' && pointerState.value.data.pointerId === pointerId) ||
            (pointerState.value.mode === 'singleTouch' && pointerState.value.data.pointerId === pointerId)
        ) {
            pointerState.value = { mode: 'none' };
            canvas.value?.releasePointerCapture(pointerId);
        } else if (pointerState.value.mode === 'twoTouch') {
            let remainingPointerData: PointerData;
            if (pointerState.value.first.pointerId === pointerId) {
                remainingPointerData = pointerState.value.second;
            } else {
                remainingPointerData = pointerState.value.first;
            }
            pointerState.value = {
                mode: 'singleTouch',
                data: remainingPointerData,
                moveThresholdPassed: true,
            };
            canvas.value?.releasePointerCapture(pointerId);
        }
    }

    boardResetEventBus.on(() => {
        pointerState.value = { mode: 'none' };
    });

    return {
        pointerState: readonly(pointerState),
        interactionLocked,
    };
}
