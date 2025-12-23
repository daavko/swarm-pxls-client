import type { InfoResponse } from '@/core/pxls-api/schemas/info.ts';
import type { Point } from '@/utils/geometry.ts';
import { type EventBusKey, useEventBus, type UseEventBusReturn } from '@vueuse/core';

export interface PixelEvent {
    x: number;
    y: number;
    colorIndex: number;
    colorRawRgba: number;
}

export interface BoardInitEvent {
    info: InfoResponse;
    board: ImageData;
}

export interface CanvasPointerEvent {
    screen: Point;
    board: Point;
    button: number;
}

const PIXEL_EVENT_BUS_KEY: EventBusKey<PixelEvent> = Symbol('Pixel event bus');
const BOARD_INIT_EVENT_BUS_KEY: EventBusKey<BoardInitEvent> = Symbol('Board init event bus');
const BOARD_RESET_EVENT_BUS_KEY: EventBusKey<void> = Symbol('Board reset event bus');
const POINTER_DOWN_EVENT_BUS_KEY: EventBusKey<CanvasPointerEvent> = Symbol('Pointer down event bus');
const POINTER_UP_EVENT_BUS_KEY: EventBusKey<CanvasPointerEvent> = Symbol('Pointer up event bus');
const POINTER_CANCEL_EVENT_BUS_KEY: EventBusKey<void> = Symbol('Pointer cancel event bus');

export function usePixelEventBus(): UseEventBusReturn<PixelEvent, unknown> {
    return useEventBus(PIXEL_EVENT_BUS_KEY);
}

export function useBoardInitEventBus(): UseEventBusReturn<BoardInitEvent, unknown> {
    return useEventBus(BOARD_INIT_EVENT_BUS_KEY);
}

export function useBoardResetEventBus(): UseEventBusReturn<void, unknown> {
    return useEventBus(BOARD_RESET_EVENT_BUS_KEY);
}

export function useCanvasPointerDownEventBus(): UseEventBusReturn<CanvasPointerEvent, unknown> {
    return useEventBus(POINTER_DOWN_EVENT_BUS_KEY);
}

export function useCanvasPointerUpEventBus(): UseEventBusReturn<CanvasPointerEvent, unknown> {
    return useEventBus(POINTER_UP_EVENT_BUS_KEY);
}

export function useCanvasPointerCancelEventBus(): UseEventBusReturn<void, unknown> {
    return useEventBus(POINTER_CANCEL_EVENT_BUS_KEY);
}
