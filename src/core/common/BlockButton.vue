<template>
    <button
        type="button"
        class="block-button"
        :class="{ 'block-button--square': square, 'block-button--borderless': borderless }">
        <slot></slot>
    </button>
</template>

<script setup lang="ts">
const { square = false, borderless = false } = defineProps<{ square?: boolean; borderless?: boolean }>();
</script>

<style scoped>
.block-button {
    display: flex;
    justify-content: center;
    align-items: center;
    color: inherit;
    border: 1px solid white;
    border-radius: 4px;

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
    }

    &:disabled {
        color: #7f7f7f;
        border-color: #7f7f7f;
        cursor: not-allowed;
    }
}

.block-button--square {
    border-radius: 0;
}

.block-button--borderless {
    border: none;
}
</style>
