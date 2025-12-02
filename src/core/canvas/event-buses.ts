import { type EventBusKey, useEventBus, type UseEventBusReturn } from '@vueuse/core';

export interface PixelEvent {
    x: number;
    y: number;
    colorIndex: number;
    colorRawRgba: number;
}

const PIXEL_EVENT_BUS_KEY: EventBusKey<PixelEvent> = Symbol('Pixel event bus');
const BOARD_INIT_EVENT_BUS_KEY: EventBusKey<ImageData> = Symbol('Board init event bus');
const BOARD_RESET_EVENT_BUS_KEY: EventBusKey<void> = Symbol('Board reset event bus');

export function usePixelEventBus(): UseEventBusReturn<PixelEvent, unknown> {
    return useEventBus(PIXEL_EVENT_BUS_KEY);
}

export function useCanvasInitEventBus(): UseEventBusReturn<ImageData, unknown> {
    return useEventBus(BOARD_INIT_EVENT_BUS_KEY);
}
export function useCanvasResetEventBus(): UseEventBusReturn<void, unknown> {
    return useEventBus(BOARD_RESET_EVENT_BUS_KEY);
}
