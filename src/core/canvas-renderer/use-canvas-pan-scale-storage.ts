import { type RemovableRef, useLocalStorage } from '@vueuse/core';

export interface CanvasPanScale {
    x: number;
    y: number;
    scale: number;
}

export function useCanvasPanScaleStorage(): RemovableRef<CanvasPanScale | null> {
    return useLocalStorage<CanvasPanScale | null>('canvas-pan-scale', null, { flush: 'sync' });
}
