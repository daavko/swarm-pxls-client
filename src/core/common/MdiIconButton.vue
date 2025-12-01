<template>
    <button>
        <MdiIcon :iconPath="$props.iconPath" :size="$props.size" :inline="$props.inline"></MdiIcon>
    </button>
</template>

<script setup lang="ts">
import MdiIcon, { type MdiIconProps } from '@/core/common/MdiIcon.vue';

defineProps<MdiIconProps>();
</script>

<style scoped>
button {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
