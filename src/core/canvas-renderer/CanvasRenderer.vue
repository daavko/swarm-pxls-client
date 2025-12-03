<template>
    <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { useCanvasRenderer } from '@/core/canvas-renderer/canvas-renderer.store.ts';
import { useCanvasAutosize } from '@/core/canvas-renderer/use-canvas-autosize.ts';
import { useRafFn } from '@vueuse/core';
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas');

const route = useRoute();
const router = useRouter();
const size = useCanvasAutosize(canvasRef);
const canvasRenderer = useCanvasRenderer();

const glError = ref<string | null>(null);

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

    if (route.query['x'] != null && typeof route.query['x'] === 'string') {
        const queryX = parseInt(route.query['x']);
        if (!isNaN(queryX)) {
            canvasRenderer.x = queryX;
        }
    }

    if (route.query['y'] != null && typeof route.query['y'] === 'string') {
        const queryY = parseInt(route.query['y']);
        if (!isNaN(queryY)) {
            canvasRenderer.y = queryY;
        }
    }

    if (route.query['scale'] != null && typeof route.query['scale'] === 'string') {
        const queryScale = parseFloat(route.query['scale']);
        if (!isNaN(queryScale)) {
            canvasRenderer.scale = queryScale;
        }
    }

    void router.replace({ query: { ...route.query, x: undefined, y: undefined, scale: undefined } });

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
