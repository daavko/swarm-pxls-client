import type { RenderLayerOptions } from '@/core/canvas-renderer/render-layer.ts';
import { type RemovableRef, useLocalStorage } from '@vueuse/core';

export function useLayerOptionsStorage(): RemovableRef<RenderLayerOptions[]> {
    return useLocalStorage<RenderLayerOptions[]>('canvas-layer-options', [], { flush: 'sync' });
}
