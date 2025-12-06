<template>
    <div v-if="selectedColor" class="info-attachment" :style="{ '--cursor-x': x + 'px', '--cursor-y': y + 'px' }">
        <div class="active-color" :style="{ '--color': selectedColor.hex }"></div>
        <div v-if="info" class="available-pixels">{{ availablePixels }}/{{ info.maxStacked }}</div>
    </div>
</template>

<script setup lang="ts">
import { useCanvasStore, useTypeAssistedCanvasInfo } from '@/core/canvas/canvas.store.ts';
import { useSession } from '@/core/session/session.store.ts';
import { useMouse } from '@vueuse/core';
import { storeToRefs } from 'pinia';

const { selectedColor } = storeToRefs(useCanvasStore());
const info = useTypeAssistedCanvasInfo();
const { availablePixels } = storeToRefs(useSession());
const { x, y } = useMouse({ type: 'page' });
</script>

<style scoped>
.info-attachment {
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    translate: calc(var(--cursor-x) + 16px) calc(var(--cursor-y) + 24px);
}

.active-color {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    border: 2px solid black;
    background-color: var(--color);
}

.available-pixels {
    position: absolute;
    color: white;
    right: 0;
    bottom: 0;
    font-size: 0.875rem;
    padding: 2px 8px;
    background: #404040;
    border: 1px solid black;
    translate: 50% 50%;
    border-radius: 50px;
}
</style>
