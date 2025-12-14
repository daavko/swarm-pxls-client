<template>
    <BlockButton v-bind="$props">
        <MdiIcon v-bind="$props"></MdiIcon>
    </BlockButton>
</template>

<script setup lang="ts">
import BlockButton from '@/core/common/BlockButton.vue';
import MdiIcon from '@/core/common/MdiIcon.vue';
import type { BlockButtonProps, MdiIconProps } from '@/core/common/types.ts';

defineProps<MdiIconProps & BlockButtonProps>();
</script>

<style scoped></style>
