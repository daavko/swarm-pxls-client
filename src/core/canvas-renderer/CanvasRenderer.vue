<template>
    <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { useCanvasRenderer } from '@/core/canvas-renderer/canvas-renderer.store.ts';
import { useCanvasAutosize } from '@/core/canvas-renderer/use-canvas-autosize.ts';
import { syncRef, useRafFn } from '@vueuse/core';
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import { storeToRefs } from 'pinia';

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas');

const size = useCanvasAutosize(canvasRef);
const canvasRenderer = useCanvasRenderer();
const { viewportWidth, viewportHeight } = storeToRefs(canvasRenderer);

const glError = ref<string | null>(null);

syncRef(size, viewportWidth, { direction: 'ltr', transform: { ltr: (v) => v.width }, flush: 'sync' });
syncRef(size, viewportHeight, { direction: 'ltr', transform: { ltr: (v) => v.height }, flush: 'sync' });

onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas) {
        glError.value = 'Canvas element not found';
        return;
    }

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
        const { width, height } = size.value;
        canvas.width = width;
        canvas.height = height;
        canvasRenderer.render(width, height);
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
}
</style>
