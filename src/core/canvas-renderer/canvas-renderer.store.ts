import { BoardLayer } from '@/core/canvas-renderer/board.ts';
import { RenderLayer, type RenderLayerOptions } from '@/core/canvas-renderer/render-layer.ts';
import { useCanvasPannerStore } from '@/core/canvas-renderer/canvas-panner.store.ts';
import { useLayerOptionsStorage } from '@/core/canvas-renderer/use-layer-options-storage.ts';
import { getViewportTransformMatrix } from '@/utils/matrix3.ts';
import { defineStore, storeToRefs } from 'pinia';
import { computed, readonly, ref, shallowRef, triggerRef, watch } from 'vue';

interface RenderLayerInternal extends RenderLayerOptions {
    renderLayer?: RenderLayer;
}

function areOptionsEqual(a: RenderLayerOptions, b: RenderLayerOptions): boolean {
    return a.name === b.name && a.enabled === b.enabled && a.opacity === b.opacity;
}

function anyOptionsChanged(a: RenderLayerOptions[], b: RenderLayerOptions[]): boolean {
    if (a.length !== b.length) {
        return true;
    }

    for (let i = 0; i < a.length; i++) {
        if (!areOptionsEqual(a[i]!, b[i]!)) {
            return true;
        }
    }

    return false;
}

function layersToOptions(layers: RenderLayerInternal[]): RenderLayerOptions[] {
    return layers.map(({ name, enabled, opacity }) => ({ name, enabled, opacity }));
}

export const useCanvasRenderer = defineStore('canvas-layers', () => {
    const layerOptionsStorage = useLayerOptionsStorage();
    const { x: panX, y: panY, scale } = storeToRefs(useCanvasPannerStore());

    const viewportWidth = ref<number | null>(null);
    const viewportHeight = ref<number | null>(null);
    const viewportX = computed((): number | null => {
        if (panX.value == null || scale.value == null || viewportWidth.value == null) {
            return null;
        } else {
            return viewportWidth.value / 2 - panX.value * scale.value;
        }
    });
    const viewportY = computed((): number | null => {
        if (panY.value == null || scale.value == null || viewportHeight.value == null) {
            return null;
        } else {
            return viewportHeight.value / 2 - panY.value * scale.value;
        }
    });
    const transformMatrix = shallowRef<Float32Array | null>(null);
    const layers = shallowRef<RenderLayerInternal[]>([]);
    const glRef = shallowRef<WebGL2RenderingContext | null>(null);

    watch(
        [viewportX, viewportY, scale, viewportWidth, viewportHeight],
        ([newX, newY, newScale, newWidth, newHeight]) => {
            if (newX == null || newY == null || newScale == null || newWidth == null || newHeight == null) {
                transformMatrix.value = null;
            } else {
                transformMatrix.value = getViewportTransformMatrix(
                    newWidth,
                    newHeight,
                    newX,
                    newY,
                    newScale,
                    transformMatrix.value,
                );
            }
            triggerRef(transformMatrix);
        },
        {
            immediate: true,
            flush: 'sync',
        },
    );

    watch(layers, (newValue, oldValue) => {
        if (anyOptionsChanged(oldValue, newValue) && anyOptionsChanged(layerOptionsStorage.value, newValue)) {
            layerOptionsStorage.value = layersToOptions(newValue);
        }
    });

    watch(layerOptionsStorage, (newVal) => {
        const currentOptions = layersToOptions(layers.value);
        if (anyOptionsChanged(newVal, currentOptions)) {
            for (const option of newVal) {
                const layerOption = layers.value.find((l) => l.name === option.name);
                if (layerOption) {
                    layerOption.enabled = option.enabled;
                    layerOption.opacity = option.opacity;
                } else {
                    layers.value.push({ ...option });
                }
            }
            triggerRef(layers);
        }
    });

    function registerLayer(layer: RenderLayer): void {
        const existingLayer = layers.value.find((l) => l.name === layer.name);
        if (existingLayer) {
            if (existingLayer.renderLayer != null) {
                console.warn(`Layer with name "${layer.name}" is already registered.`);
                return;
            }
            existingLayer.renderLayer = layer;
        } else {
            layers.value.push({
                ...layer.defaultOptions,
                renderLayer: layer,
            });
        }

        if (glRef.value) {
            layer.createRenderables(glRef.value);
        }

        triggerRef(layers);
    }

    function unregisterLayer(layerName: string): void {
        const layerIndex = layers.value.findIndex((l) => l.name === layerName);
        if (layerIndex !== -1) {
            const [layer] = layers.value.splice(layerIndex, 1);
            layer?.renderLayer?.destroyRenderables();
        }

        triggerRef(layers);
    }

    function renderContextCreated(gl: WebGL2RenderingContext): void {
        glRef.value = gl;
        for (const layer of layers.value) {
            layer.renderLayer?.destroyRenderables();
            layer.renderLayer?.createRenderables(gl);
        }
    }

    function renderContextDestroyed(): void {
        for (const layer of layers.value) {
            layer.renderLayer?.destroyRenderables();
        }
        glRef.value = null;
    }

    function render(): void {
        const viewportWidthValue = viewportWidth.value;
        const viewportHeightValue = viewportHeight.value;
        if (viewportWidthValue == null || viewportHeightValue == null) {
            return;
        }

        const viewportTransformMatrix = transformMatrix.value;
        if (viewportTransformMatrix == null) {
            return;
        }

        const gl = glRef.value;
        if (!gl) {
            return;
        }

        gl.viewport(0, 0, viewportWidthValue, viewportHeightValue);
        gl.clearColor(26 / 255, 26 / 255, 26 / 255, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        for (const layer of layers.value) {
            if (layer.enabled && layer.opacity > 0 && layer.renderLayer) {
                layer.renderLayer.render(viewportTransformMatrix);
            }
        }
    }

    registerLayer(new BoardLayer());

    return {
        viewportWidth,
        viewportHeight,
        viewportX: readonly(viewportX),
        viewportY: readonly(viewportY),
        gl: glRef,
        glTransformMatrix: readonly(transformMatrix),
        registerLayer,
        unregisterLayer,
        renderContextCreated,
        renderContextDestroyed,
        render,
    };
});
