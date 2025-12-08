<template>
    <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { useCanvasRenderer } from '@/core/canvas-renderer/canvas-renderer.store.ts';
import { useCanvasViewportStore } from '@/core/canvas-renderer/canvas-viewport.store.ts';
import { useCanvasAutosize } from '@/core/canvas-renderer/use-canvas-autosize.ts';
import { useRafFn } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useCanvasPanner } from '@/core/canvas-renderer/use-canvas-panner.ts';

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas');

const canvasRenderer = useCanvasRenderer();
const { viewportSize } = storeToRefs(useCanvasViewportStore());

const size = useCanvasAutosize(canvasRef);
const panner = useCanvasPanner(canvasRef);

const glError = ref<string | null>(null);

onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas) {
        glError.value = 'Canvas element not found';
        return;
    }

    watch(
        size,
        ({ width, height }) => {
            canvas.width = width;
            canvas.height = height;
            viewportSize.value = { width, height };
        },
        { immediate: true, flush: 'sync' },
    );

    const gl = canvas.getContext('webgl2', {
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
    });
    if (!gl) {
        glError.value = 'WebGL2 not supported';
        return;
    }

    canvasRenderer.renderContextCreated(gl);

    useRafFn(() => {
        canvasRenderer.render();
    });
});

onBeforeUnmount(() => {
    canvasRenderer.renderContextDestroyed();
});
</script>

<style scoped>
canvas {
    width: 100%;
    height: 100%;
    display: block;
    touch-action: none;
}
</style>
