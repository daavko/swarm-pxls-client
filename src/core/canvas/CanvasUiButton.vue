<template>
    <MdiIconButton circular :iconPath="iconPath" ref="button" v-bind="$attrs"></MdiIconButton>
    <TooltipOverlay v-if="$slots['tooltip']" :target="button"><slot name="tooltip"></slot></TooltipOverlay>
</template>

<script setup lang="ts">
import MdiIconButton from '@/core/common/MdiIconButton.vue';
import TooltipOverlay from '@/core/tooltip/TooltipOverlay.vue';
import { useTemplateRef } from 'vue';

defineProps<{
    iconPath: string;
}>();

const button = useTemplateRef('button');
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
