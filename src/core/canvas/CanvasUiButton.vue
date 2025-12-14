<template>
    <MdiIconButton circular :iconPath="iconPath"></MdiIconButton>
</template>

<script setup lang="ts">
import MdiIconButton from '@/core/common/MdiIconButton.vue';

defineProps<{
    iconPath: string;
}>();
</script>

<style scoped>
button {
    width: 40px;
    height: 40px;
    --button-bg-color: black;
    --button-text-color: white;
    --button-border-color: #666666;
    --button-border-thickness: 2px;

    &:hover {
        background: #333;
    }
}
</style>
