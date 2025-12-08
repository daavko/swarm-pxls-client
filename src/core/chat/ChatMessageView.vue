<template>
    <p>{{ chatMessage.author }}: {{ chatMessage.message_raw }}</p>
</template>

<script setup lang="ts">
import type { ChatMessage } from '@/core/chat/types.ts';
import type { DeepReadonly } from 'vue';

defineProps<{
    chatMessage: DeepReadonly<ChatMessage>;
}>();
</script>

<style scoped></style>
