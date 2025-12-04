import { BoardLayer } from '@/core/canvas-renderer/board.ts';
import { RenderLayer, type RenderLayerOptions } from '@/core/canvas-renderer/render-layer.ts';
import { useCanvasPanScaleStorage } from '@/core/canvas-renderer/use-canvas-pan-scale-storage.ts';
import { useLayerOptionsStorage } from '@/core/canvas-renderer/use-layer-options-storage.ts';
import { useCanvas } from '@/core/canvas/canvas.store.ts';
import { getUniformMatrix } from '@/utils/matrix3.ts';
import { defineStore } from 'pinia';
import { ref, shallowRef, triggerRef, watch } from 'vue';

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
    const canvasPanScaleStorage = useCanvasPanScaleStorage();
    const canvasStore = useCanvas();

    const x = ref<number | null>(canvasPanScaleStorage.value?.x ?? null);
    const y = ref<number | null>(canvasPanScaleStorage.value?.y ?? null);
    const scale = ref<number | null>(canvasPanScaleStorage.value?.scale ?? null);

    const newLayers = shallowRef<RenderLayerInternal[]>([]);
    const glRef = shallowRef<WebGL2RenderingContext | null>(null);

    watch([x, y, scale], ([newX, newY, newScale]) => {
        if (newX != null && newY != null && newScale != null) {
            canvasPanScaleStorage.value = { x: newX, y: newY, scale: newScale };
        }
    });

    watch(newLayers, (newValue, oldValue) => {
        if (anyOptionsChanged(oldValue, newValue) && anyOptionsChanged(layerOptionsStorage.value, newValue)) {
            layerOptionsStorage.value = layersToOptions(newValue);
        }
    });

    watch(layerOptionsStorage, (newVal) => {
        const currentOptions = layersToOptions(newLayers.value);
        if (anyOptionsChanged(newVal, currentOptions)) {
            // update options in newLayers
            for (const option of newVal) {
                const layerOption = newLayers.value.find((l) => l.name === option.name);
                if (layerOption) {
                    layerOption.enabled = option.enabled;
                    layerOption.opacity = option.opacity;
                } else {
                    newLayers.value.push({ ...option });
                }
            }
            triggerRef(newLayers);
        }
    });

    function registerLayer(layer: RenderLayer): void {
        const existingLayer = newLayers.value.find((l) => l.name === layer.name);
        if (existingLayer) {
            if (existingLayer.renderLayer != null) {
                console.warn(`Layer with name "${layer.name}" is already registered.`);
                return;
            }
            existingLayer.renderLayer = layer;
        } else {
            newLayers.value.push({
                ...layer.defaultOptions,
                renderLayer: layer,
            });
        }

        if (glRef.value) {
            layer.createRenderables(glRef.value);
        }

        triggerRef(newLayers);
    }

    function unregisterLayer(layerName: string): void {
        const layerIndex = newLayers.value.findIndex((l) => l.name === layerName);
        if (layerIndex !== -1) {
            const [layer] = newLayers.value.splice(layerIndex, 1);
            layer?.renderLayer?.destroyRenderables();
        }

        triggerRef(newLayers);
    }

    function renderContextCreated(gl: WebGL2RenderingContext): void {
        glRef.value = gl;
        for (const layer of newLayers.value) {
            layer.renderLayer?.destroyRenderables();
            layer.renderLayer?.createRenderables(gl);
        }
    }

    function renderContextDestroyed(): void {
        for (const layer of newLayers.value) {
            layer.renderLayer?.destroyRenderables();
        }
        glRef.value = null;
    }

    function render(viewportWidth: number, viewportHeight: number): void {
        const gl = glRef.value;
        if (!gl) {
            return;
        }

        gl.viewport(0, 0, viewportWidth, viewportHeight);
        gl.clearColor(26 / 255, 26 / 255, 26 / 255, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        if (x.value == null && canvasStore.info != null) {
            x.value = canvasStore.info.width / 2;
        }
        if (y.value == null && canvasStore.info != null) {
            y.value = canvasStore.info.height / 2;
        }

        if (x.value == null || y.value == null) {
            return;
        }

        if (scale.value == null) {
            scale.value = 1;
        }

        const uniformX = viewportWidth / 2 - x.value * scale.value;
        const uniformY = viewportHeight / 2 - y.value * scale.value;
        const uniformMatrix = new Float32Array(
            getUniformMatrix(viewportWidth, viewportHeight, uniformX, uniformY, scale.value),
        );

        for (const layer of newLayers.value) {
            if (layer.enabled && layer.opacity > 0 && layer.renderLayer) {
                layer.renderLayer.render(uniformMatrix);
            }
        }
    }

    registerLayer(new BoardLayer());

    return {
        x,
        y,
        scale,
        gl: glRef,
        registerLayer,
        unregisterLayer,
        renderContextCreated,
        renderContextDestroyed,
        render,
    };
});
