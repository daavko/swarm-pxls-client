<template>
    <MdiIconButton :iconPath="iconPath"></MdiIconButton>
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
    background: black;
    color: white;
    border-radius: 50%;
    border: 2px solid #666666;

    &:hover {
        background: #333;
    }
}
</style>
