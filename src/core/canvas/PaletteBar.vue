<template>
    <div v-if="info === null" v-bind="$attrs" class="palette-loading">Loading palette...</div>
    <template v-else>
        <div v-if="collapsed" v-bind="$attrs" class="palette-collapsed">
            <button v-if="selectedColor === null" class="select-color" @click="toggleCollapsed">Select color</button>
            <div class="palette-selected-buttons" v-else>
                <MdiIconButton
                    class="palette-item palette-clear palette-clear--standalone"
                    borderless
                    transparent
                    :iconPath="mdiCloseThick"
                    @click="selectColor(null)"></MdiIconButton>
                <button
                    class="palette-item palette-color palette-color--standalone"
                    :style="{ '--palette-bar_palette-color': selectedColor.hex }"
                    @click="toggleCollapsed">
                    <span class="palette-color__index">{{ selectedColor.index }}</span>
                </button>
            </div>
        </div>
        <div
            v-else
            v-bind="$attrs"
            class="palette-items-container"
            :class="{ 'palette-items-container--vertical': paletteItemsVertical }"
            ref="paletteBar">
            <MdiIconButton
                class="palette-collapse"
                :class="{ 'palette-collapse--vertical': paletteItemsVertical }"
                borderless
                square
                transparent
                :iconPath="paletteItemsVertical ? mdiChevronDown : mdiChevronRight"
                @click="toggleCollapsed"></MdiIconButton>
            <div class="palette-items" :class="{ 'palette-items--vertical': paletteItemsVertical }" ref="paletteItems">
                <MdiIconButton
                    class="palette-item palette-clear"
                    borderless
                    transparent
                    :iconPath="mdiCloseThick"
                    @click="selectColor(null)"></MdiIconButton>
                <template v-for="paletteItem in info.palette" :key="paletteItem.hex">
                    <button
                        class="palette-item palette-color"
                        :class="{ 'palette-color--selected': selectedColorIndex === paletteItem.index }"
                        :style="{ '--palette-bar_palette-color': paletteItem.hex }"
                        @click="selectColor(paletteItem.index)">
                        <span class="palette-color__index">{{ paletteItem.index }}</span>
                    </button>
                </template>
            </div>
        </div>
    </template>
</template>

<script setup lang="ts">
import { useCanvasStore } from '@/core/canvas/canvas.store.ts';
import MdiIconButton from '@/core/common/MdiIconButton.vue';
import { mdiChevronDown, mdiChevronRight, mdiCloseThick } from '@mdi/js';
import { type Fn, onClickOutside, useElementSize } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, ref, useTemplateRef, watch } from 'vue';

const canvas = useCanvasStore();
const { info, selectedColorIndex, selectedColor } = storeToRefs(canvas);

const paletteBarRef = useTemplateRef('paletteBar');
const paletteItemsRef = useTemplateRef('paletteItems');
const { width: paletteItemsWidth, height: paletteItemsHeight } = useElementSize(paletteItemsRef, undefined, {
    box: 'border-box',
});

const collapsed = ref(true);
const paletteItemsVertical = computed(() => {
    const w = paletteItemsWidth.value;
    const h = paletteItemsHeight.value;
    return w > 0 && h > 0 && h > w;
});

let outsideClickStopHandle: Fn | null = null;

watch(collapsed, () => {
    if (!collapsed.value) {
        const { stop } = onClickOutside(
            paletteBarRef,
            () => {
                collapsed.value = true;
                outsideClickStopHandle?.();
                outsideClickStopHandle = null;
            },
            { controls: true },
        );
        outsideClickStopHandle = stop;
    } else {
        outsideClickStopHandle?.();
        outsideClickStopHandle = null;
    }
});

function toggleCollapsed(): void {
    collapsed.value = !collapsed.value;
}

function selectColor(index: number | null): void {
    canvas.selectColor(index);
    collapsed.value = true;
}
</script>

<style scoped>
.palette-loading {
    padding: 16px;
    align-self: center;
    background-color: var(--panel-bg-color);
    color: var(--panel-text-color);
    border-radius: 8px;
}

.palette-collapsed {
    background-color: var(--panel-bg-color);
    color: var(--panel-text-color);
    border-radius: 8px;
}

.select-color {
    padding: 16px;
    color: var(--panel-text-color);
}

.palette-selected-buttons {
    display: flex;
    align-items: end;
    gap: 4px;
    padding: 8px;
}

.palette-items-container {
    background-color: var(--panel-bg-color);
    color: var(--panel-text-color);
    border-radius: 8px;
    display: flex;

    &.palette-items-container--vertical {
        flex-direction: column;
    }
}

.palette-items {
    --palette-columns: 20;
    display: grid;
    grid-template-columns: repeat(var(--palette-columns), 32px);
    grid-auto-rows: 32px;
    gap: 8px;
    padding: 16px 16px 16px 0;
    max-height: 60dvh;
    overflow-y: auto;

    &.palette-items--vertical {
        padding: 12px 12px 12px 12px;
    }

    @media (width < 1200px) {
        --palette-columns: 16;
    }

    @media (width < 1000px) {
        --palette-columns: 12;
    }

    @media (width < 800px) {
        --palette-columns: 10;
    }

    @media (width < 700px) {
        --palette-columns: 8;
    }

    @media (width < 600px) {
        --palette-columns: 5;
    }

    @media (width < 500px) {
        --palette-columns: 3;
    }

    @media (width < 400px) {
        --palette-columns: 2;
    }
}

.palette-collapse {
    padding-inline: 8px;

    &.palette-collapse {
        padding-block: 4px;
        padding-inline: 0;
    }
}

.palette-item {
    width: 32px;
    height: 32px;
}

.palette-clear {
    &.palette-clear--standalone {
        width: 40px;
        height: 40px;
    }
}

.palette-color {
    border: 2px solid black;
    border-radius: 4px;
    background: var(--palette-bar_palette-color, transparent);
    position: relative;

    &:hover:not(.palette-color--selected, .palette-color--standalone) {
        outline: 2px solid lab(100 0 0 / 0.3);
        outline-offset: 1px;
    }

    &.palette-color--selected {
        outline: 2px solid white;
        outline-offset: 1px;
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
        color: var(--panel-text-color);
        background: #404040;
        border: 1px solid black;
        border-radius: 20px;
        width: 24px;
    }
}
</style>
