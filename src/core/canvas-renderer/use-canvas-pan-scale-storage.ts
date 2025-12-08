import type { Point } from '@/utils/geometry.ts';
import { type RemovableRef, StorageSerializers, useLocalStorage } from '@vueuse/core';

export interface CanvasPanScale {
    pan: Point;
    scale: number;
}

export function useCanvasPanScaleStorage(): RemovableRef<CanvasPanScale | null> {
    return useLocalStorage<CanvasPanScale | null>('canvas-pan-scale', null, {
        serializer: StorageSerializers.object,
        flush: 'sync',
    });
}
