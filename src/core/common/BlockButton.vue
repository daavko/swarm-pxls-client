<template>
    <button
        type="button"
        class="block-button"
        :class="{
            'block-button--square': square,
            'block-button--circular': circular,
            'block-button--borderless': borderless,
            'block-button--transparent': transparent,
        }">
        <slot></slot>
    </button>
</template>

<script setup lang="ts">
import type { BlockButtonProps } from '@/core/common/types.ts';

const { square = false, circular = false, borderless = false, transparent = false } = defineProps<BlockButtonProps>();
</script>

<style scoped>
.block-button {
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--button-bg-color);
    color: var(--button-text-color);
    border: var(--button-border-thickness) solid var(--button-border-color);
    border-radius: 4px;

    &.block-button--square {
        border-radius: 0;
    }

    &.block-button--circular {
        border-radius: 50%;
    }

    &.block-button--borderless {
        border: none;
    }

    &:hover:not(:disabled) {
        background: var(--button-bg-color-hover);
    }

    &:active:not(:disabled) {
        background: var(--button-bg-color-active);
    }

    &:disabled {
        color: var(--button-text-color-disabled);
        border-color: var(--button-border-color-disabled);
        background: var(--button-bg-color-disabled);
        cursor: not-allowed;
    }

    &.block-button--transparent {
        --button-bg-color: transparent;
        --button-bg-color-hover: lab(100 0 0 / 0.1);
        --button-bg-color-active: lab(100 0 0 / 0.05);
        --button-bg-color-disabled: transparent;
    }
}
</style>
