<template>
    <div class="palette-bar">
        <button class="palette-item palette-clear flex-center">
            <MdiIcon :iconPath="mdiCloseThick"></MdiIcon>
        </button>
        <template v-for="(color, index) in colors" :key="color">
            <button class="palette-item palette-color" :style="`--color: ${color}`">
                <span class="palette-color__index">{{ index }}</span>
            </button>
        </template>
    </div>
</template>

<script setup lang="ts">
import MdiIcon from '@/core/common/MdiIcon.vue';
import { mdiCloseThick } from '@mdi/js';

// temporary list of colors
const colors = [
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#F333FF',
    '#33FFF5',
    '#F5FF33',
    '#FF33A8',
    '#A833FF',
    '#33FFA8',
    '#FFA833',
    '#FF3333',
    '#33FF33',
    '#3333FF',
];
</script>

<style scoped>
.palette-bar {
    display: flex;
    justify-content: center;
    padding-block: 16px;
    padding-inline: 8px;
    gap: 8px;
    background: rgba(0, 0, 0, 0.7);
}

.palette-item {
    width: 32px;
    height: 32px;
}

.palette-clear {
    color: white;
}

.palette-color {
    border: 2px solid black;
    border-radius: 4px;
    background: var(--color, transparent);
    position: relative;

    .palette-color__index {
        display: inline-block;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        font-size: 0.75rem;
        color: white;
        background: dimgrey;
        border: 1px solid black;
        border-radius: 20px;
        width: 24px;
    }
}
</style>
