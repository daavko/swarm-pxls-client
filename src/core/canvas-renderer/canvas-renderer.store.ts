import { RenderLayer, type RenderLayerOptions } from '@/core/canvas-renderer/render-layer.ts';
import { useLayerOptionsStorage } from '@/core/canvas-renderer/use-layer-options-storage.ts';
import { syncRef } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref, shallowRef, triggerRef } from 'vue';
import { getUniformMatrix } from '@/utils/matrix3.ts';

export const useCanvasRenderer = defineStore('canvas-layers', () => {
    const layerOptionsStorage = useLayerOptionsStorage();

    const x = ref<number>(0);
    const y = ref<number>(0);
    const scale = ref<number>(1);

    const layers = shallowRef<RenderLayer[]>([]);
    const layerOptions = ref<RenderLayerOptions[]>(layerOptionsStorage.value);
    const glRef = shallowRef<WebGL2RenderingContext | null>(null);

    syncRef(layerOptions, layerOptionsStorage, { deep: true });

    function registerLayer(layer: RenderLayer): void {
        if (layers.value.some((l) => l.name === layer.name)) {
            console.warn(`Layer with name "${layer.name}" is already registered.`);
            return;
        }

        layers.value.push(layer);

        if (!layerOptions.value.some((opt) => opt.name === layer.name)) {
            layerOptions.value.push(layer.defaultOptions);
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
            layer?.destroyRenderables();
        }

        triggerRef(layers);
    }

    function renderContextCreated(gl: WebGL2RenderingContext): void {
        glRef.value = gl;
        for (const layer of layers.value) {
            layer.createRenderables(gl);
        }
    }

    function renderContextDestroyed(): void {
        for (const layer of layers.value) {
            layer.destroyRenderables();
        }
        glRef.value = null;
    }

    function render(width: number, height: number): void {
        const gl = glRef.value;
        if (!gl) {
            return;
        }

        gl.viewport(0, 0, width, height);
        gl.clearColor(26 / 255, 26 / 255, 26 / 255, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const uniformMatrix = new Float32Array(getUniformMatrix(width, height, x.value, y.value, scale.value));

        for (const layer of layers.value) {
            layer.render(uniformMatrix);
        }
    }

    return {
        x,
        y,
        scale,
        layers,
        layerOptions,
        gl: glRef,
        registerLayer,
        unregisterLayer,
        renderContextCreated,
        renderContextDestroyed,
        render,
    };
});
