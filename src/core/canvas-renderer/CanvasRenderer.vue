<template>
    <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { useCanvasAutosize } from '@/core/canvas-renderer/use-canvas-autosize.ts';
import { useRafFn } from '@vueuse/core';
import { onMounted, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas');

const route = useRoute();
const router = useRouter();
const size = useCanvasAutosize(canvasRef);

const glRef = ref<WebGL2RenderingContext | null>(null);
const glError = ref<string | null>(null);

const x = ref<number>(0);
const y = ref<number>(0);
const scale = ref<number>(1);

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

    glRef.value = gl;

    if (route.query['x'] != null && typeof route.query['x'] === 'string') {
        const queryX = parseInt(route.query['x']);
        if (!isNaN(queryX)) {
            x.value = queryX;
        }
    }

    if (route.query['y'] != null && typeof route.query['y'] === 'string') {
        const queryY = parseInt(route.query['y']);
        if (!isNaN(queryY)) {
            y.value = queryY;
        }
    }

    if (route.query['scale'] != null && typeof route.query['scale'] === 'string') {
        const queryScale = parseFloat(route.query['scale']);
        if (!isNaN(queryScale)) {
            scale.value = queryScale;
        }
    }

    void router.replace({ query: { ...route.query, x: null, y: null, scale: null } });

    useRafFn(() => {
        const { width, height } = size.value;
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        render();
    });
});

function render(): void {
    const gl = glRef.value;
    if (!gl) {
        return;
    }

    gl.clearColor(26 / 255, 26 / 255, 26 / 255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const { width, height } = size.value;
    // todo: rendering code
}
</script>

<style scoped>
canvas {
    width: 100%;
    height: 100%;
    display: block;
}
</style>
