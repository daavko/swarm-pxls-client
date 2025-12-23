import { type Point, pointStorageSchema } from '@/utils/geometry.ts';
import { typedStorageSerializer } from '@/utils/typed-storage-serializer.ts';
import { type RemovableRef, useLocalStorage } from '@vueuse/core';
import * as v from 'valibot';

const canvasPanScaleStorageSchema = v.nullable(
    v.object({
        pan: pointStorageSchema,
        scale: v.number(),
    }),
);

export interface CanvasPanScale {
    pan: Point;
    scale: number;
}

export function useCanvasPanScaleStorage(): RemovableRef<CanvasPanScale | null> {
    return useLocalStorage<CanvasPanScale | null>('canvas-pan-scale', null, {
        serializer: typedStorageSerializer(canvasPanScaleStorageSchema),
        flush: 'sync',
    });
}
