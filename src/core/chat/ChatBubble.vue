<template>
    <div class="chat-bubble">
        <div class="chat-messages">
            <template v-for="(message, index) in chatStore.messages" :key="message.id">
                <hr v-if="index !== 0" class="chat-message-separator" />
                <ChatMessageView :chatMessage="message" class="chat-message"></ChatMessageView>
            </template>
        </div>
        <div class="chat-input"></div>
    </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/core/chat/chat.store.ts';
import ChatMessageView from '@/core/chat/ChatMessageView.vue';
import { onMounted } from 'vue';

const chatStore = useChatStore();

onMounted(() => {
    void chatStore.loadChatHistory();
});
</script>

<style scoped>
.chat-bubble {
    background-color: rgba(0, 0, 0, 0.85);
    color: white;
    border-radius: 8px;
    min-width: 300px;
    min-height: 150px;
    max-width: 400px;
    max-height: 400px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.chat-messages {
    padding: 8px;
    overflow-y: auto;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.chat-message {
    word-break: break-word;
}

.chat-message-separator {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.4);
}

.chat-input {
    border-top: 1px solid white;
    height: 30px;
    flex-shrink: 0;
}
</style>
