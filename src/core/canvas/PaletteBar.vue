<template>
    <div class="palette-bar">
        <p v-if="info === null" class="palette-loading">Loading palette...</p>
        <template v-else>
            <template v-if="collapsed">
                <button v-if="selectedColor === null" class="select-color" @click="toggleCollapsed">
                    Select color
                </button>
                <div class="palette-selected-buttons" v-else>
                    <MdiIconButton
                        :iconPath="mdiCloseThick"
                        class="palette-item palette-clear palette-clear--standalone"
                        @click="selectColor(null)"></MdiIconButton>
                    <button
                        class="palette-item palette-color palette-color--standalone"
                        :style="`--color: ${selectedColor.hex}`"
                        @click="toggleCollapsed">
                        <span class="palette-color__index">{{ selectedColor.index }}</span>
                    </button>
                </div>
            </template>
            <template v-else>
                <MdiIconButton
                    :iconPath="mdiChevronRight"
                    class="palette-collapse"
                    @click="toggleCollapsed"></MdiIconButton>
                <div class="palette-items">
                    <MdiIconButton
                        :iconPath="mdiCloseThick"
                        class="palette-item palette-clear"
                        @click="selectColor(null)"></MdiIconButton>
                    <template v-for="paletteItem in info.palette" :key="paletteItem.hex">
                        <button
                            class="palette-item palette-color"
                            :class="{ 'palette-color--selected': selectedColorIndex === paletteItem.index }"
                            :style="{ '--color': paletteItem.hex }"
                            @click="selectColor(paletteItem.index)">
                            <span class="palette-color__index">{{ paletteItem.index }}</span>
                        </button>
                    </template>
                </div>
            </template>
        </template>
    </div>
</template>

<script setup lang="ts">
import { useCanvasStore } from '@/core/canvas/canvas.store.ts';
import MdiIconButton from '@/core/common/MdiIconButton.vue';
import { mdiChevronRight, mdiCloseThick } from '@mdi/js';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

const canvas = useCanvasStore();
const { info, selectedColorIndex, selectedColor } = storeToRefs(canvas);

const collapsed = ref(true);

function toggleCollapsed(): void {
    collapsed.value = !collapsed.value;
}

function selectColor(index: number | null): void {
    canvas.selectColor(index);
    collapsed.value = true;
}
</script>

<style scoped>
.palette-bar {
    display: flex;
    justify-content: center;
    border-radius: 8px;
    overflow: hidden;
    gap: 8px;
    background: rgba(0, 0, 0, 0.7);
}

.palette-loading {
    padding: 16px;
    color: white;
    align-self: center;
}

.select-color {
    padding: 16px;
    color: white;
}

.palette-selected-buttons {
    display: flex;
    align-items: end;
    gap: 4px;
    padding: 8px;
}

.palette-items {
    display: grid;
    grid-template-columns: minmax(0, auto) repeat(20, minmax(0, auto));
    grid-auto-rows: minmax(0, auto);
    gap: 8px;
    padding-block: 16px;
    padding-right: 16px;
}

.palette-collapse {
    height: 100%;
    color: white;
    padding-inline: 8px;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
    }
}

.palette-item {
    width: 32px;
    height: 32px;
}

.palette-clear {
    color: white;

    &.palette-clear--standalone {
        width: 40px;
        height: 40px;
    }
}

.palette-color {
    border: 2px solid black;
    border-radius: 4px;
    background: var(--color, transparent);
    position: relative;

    &.palette-color--selected {
        outline: 3px solid white;
        outline-offset: 2px;
    }

    &.palette-color--standalone {
        margin-top: 8px;
        width: 40px;
        height: 40px;

        .palette-color__index {
            font-size: 1.125rem;
            width: 32px;
        }
    }

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
