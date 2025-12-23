import type { RenderLayerOptions } from '@/core/canvas-renderer/render-layer.ts';
import { typedStorageSerializer } from '@/utils/typed-storage-serializer.ts';
import { type RemovableRef, useLocalStorage } from '@vueuse/core';
import * as v from 'valibot';

const renderLayerOptionsSchema = v.array(
    v.object({
        name: v.string(),
        opacity: v.number(),
        enabled: v.boolean(),
    }),
);

export function useLayerOptionsStorage(): RemovableRef<RenderLayerOptions[]> {
    return useLocalStorage<RenderLayerOptions[]>('canvas-layer-options', [], {
        serializer: typedStorageSerializer(renderLayerOptionsSchema),
        flush: 'sync',
    });
}
