<template>
    <svg viewBox="0 0 24 24" :style="`--icon-size: ${size}px`" :class="{ 'inline-icon': inline }">
        <path :d="iconPath" />
    </svg>
</template>

<script setup lang="ts">
export interface MdiIconProps {
    iconPath: string;
    size?: number;
    inline?: boolean;
}
const { iconPath, size = 24, inline = false } = defineProps<MdiIconProps>();
</script>

<style scoped>
svg {
    width: var(--icon-size);
    height: var(--icon-size);
    fill: currentColor;
}

.inline-icon {
    display: inline-block;
    vertical-align: middle;
}
</style>
