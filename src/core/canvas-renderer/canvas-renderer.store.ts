import { BoardLayer } from '@/core/canvas-renderer/builtin-layers/board.ts';
import { ReticleLayer } from '@/core/canvas-renderer/builtin-layers/reticle.ts';
import { useCanvasViewportStore } from '@/core/canvas-renderer/canvas-viewport.store.ts';
import { RenderLayer, type RenderLayerOptions } from '@/core/canvas-renderer/render-layer.ts';
import { useLayerOptionsStorage } from '@/core/canvas-renderer/use-layer-options-storage.ts';
import { getViewportTransformMatrix } from '@/utils/matrix3.ts';
import { defineStore, storeToRefs } from 'pinia';
import { markRaw, readonly, shallowReactive, shallowRef, triggerRef, watch } from 'vue';

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
    const { viewportSize, viewportOffset, scale } = storeToRefs(useCanvasViewportStore());

    const transformMatrix = shallowRef<Float32Array | null>(null);
    const layers = shallowRef<RenderLayerInternal[]>(shallowReactive([]));
    const glRef = shallowRef<WebGL2RenderingContext | null>(null);

    watch(
        [viewportOffset, scale, viewportSize],
        ([offset, newScale, size]) => {
            if (!offset || newScale == null || !size) {
                transformMatrix.value = null;
            } else {
                const { x, y } = offset;
                const { width, height } = size;
                transformMatrix.value = getViewportTransformMatrix(
                    width,
                    height,
                    x,
                    y,
                    newScale,
                    transformMatrix.value,
                );
            }
            triggerRef(transformMatrix);
        },
        {
            immediate: true,
            flush: 'sync',
            deep: true,
        },
    );

    watch(
        layers,
        (newValue, oldValue) => {
            if (anyOptionsChanged(layerOptionsStorage.value, newValue) || anyOptionsChanged(oldValue, newValue)) {
                layerOptionsStorage.value = layersToOptions(newValue);
            }
        },
        { flush: 'post' },
    );

    watch(
        layerOptionsStorage,
        (newVal) => {
            const currentOptions = layersToOptions(layers.value);
            if (anyOptionsChanged(newVal, currentOptions)) {
                for (const option of newVal) {
                    const layerOption = layers.value.find((l) => l.name === option.name);
                    if (layerOption) {
                        layerOption.enabled = option.enabled;
                        layerOption.opacity = option.opacity;
                    } else {
                        layers.value.push(shallowReactive({ ...option }));
                    }
                }
            }
        },
        { immediate: true },
    );

    function registerLayer(layer: RenderLayer): void {
        const existingLayer = layers.value.find((l) => l.name === layer.name);
        if (existingLayer) {
            if (existingLayer.renderLayer != null) {
                console.warn(`Layer with name "${layer.name}" is already registered.`);
                return;
            }
            markRaw(layer);
            existingLayer.renderLayer = layer;
        } else {
            markRaw(layer);
            layers.value.push(
                shallowReactive({
                    ...layer.defaultOptions,
                    renderLayer: layer,
                }),
            );
        }

        if (glRef.value) {
            layer.createRenderables(glRef.value);
        }
    }

    function unregisterLayer(layerName: string): void {
        const layerIndex = layers.value.findIndex((l) => l.name === layerName);
        if (layerIndex !== -1) {
            const [layer] = layers.value.splice(layerIndex, 1);
            layer?.renderLayer?.destroyRenderables();
        }
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
        const gl = glRef.value;
        if (!gl) {
            return;
        }

        if (!viewportSize.value) {
            return;
        }

        gl.viewport(0, 0, viewportSize.value.width, viewportSize.value.height);
        gl.clearColor(26 / 255, 26 / 255, 26 / 255, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const viewportTransformMatrix = transformMatrix.value;
        if (!viewportTransformMatrix) {
            return;
        }

        for (const layer of layers.value) {
            if (layer.enabled && layer.opacity > 0 && layer.renderLayer) {
                layer.renderLayer.render(viewportTransformMatrix);
            }
        }
    }

    registerLayer(new BoardLayer());
    registerLayer(new ReticleLayer());

    return {
        gl: glRef,
        glTransformMatrix: readonly(transformMatrix),
        registerLayer,
        unregisterLayer,
        renderContextCreated,
        renderContextDestroyed,
        render,
    };
});
