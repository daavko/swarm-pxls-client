import type { ChatMessage } from '@/core/chat/types.ts';
import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

export const useChatStore = defineStore('chat', () => {
    const messages = ref<ChatMessage[]>([]);

    return {
        messages: readonly(messages),
    };
});
