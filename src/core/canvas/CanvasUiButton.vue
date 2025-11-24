<template>
    <button class="flex-center">
        <MdiIcon :iconPath="iconPath"></MdiIcon>
    </button>
</template>

<script setup lang="ts">
import MdiIcon from '@/core/common/MdiIcon.vue';

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

    &:hover {
        background: #333;
    }
}
</style>
