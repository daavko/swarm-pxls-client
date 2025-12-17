<template>
    <div class="chat-bubble">
        <div v-if="loadState === 'loading'" class="chat-loading">
            <p>Loading chat...</p>
        </div>
        <template v-else-if="loadState === 'success'">
            <div class="chat-messages" ref="chatMessagesContainer">
                <template v-for="(message, index) in messages" :key="message.id">
                    <hr v-if="index !== 0" class="chat-message-separator" />
                    <ChatMessageView :chatMessage="message" class="chat-message"></ChatMessageView>
                </template>
            </div>
            <div class="chat-input"></div>
        </template>
        <div v-else-if="loadState === 'error'" class="chat-error">
            <p>There was an error when loading chat.</p>
            <BlockButton class="chat-reload" @click="chatStore.loadChatHistory">Reload</BlockButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/core/chat/chat.store.ts';
import ChatMessageView from '@/core/chat/ChatMessageView.vue';
import BlockButton from '@/core/common/BlockButton.vue';
import { useScroll } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { nextTick, onMounted, useTemplateRef, watch } from 'vue';

const chatMessagesContainer = useTemplateRef<HTMLElement>('chatMessagesContainer');

const chatStore = useChatStore();
const { messages, loadState } = storeToRefs(chatStore);

onMounted(() => {
    void chatStore.loadChatHistory();

    const { y, arrivedState } = useScroll(chatMessagesContainer);

    watch(
        messages,
        (value, oldValue) => {
            if (oldValue == null || (oldValue.length === 0 && value.length > 0)) {
                void nextTick(() => {
                    y.value = chatMessagesContainer.value?.scrollHeight ?? 0;
                });
            } else if (
                (value.length !== oldValue.length ||
                    (value.length > 0 &&
                        oldValue.length > 0 &&
                        value[value.length - 1]!.id !== oldValue[oldValue.length - 1]!.id)) &&
                arrivedState.bottom
            ) {
                const currentScroll = y.value;
                void nextTick(() => {
                    y.value = chatMessagesContainer.value?.scrollHeight ?? currentScroll;
                });
            }
        },
        { immediate: true },
    );
});
</script>

<style scoped>
.chat-bubble {
    background-color: var(--panel-bg-color);
    color: var(--panel-text-color);
    border-radius: 8px;
    min-width: 300px;
    min-height: 150px;
    max-width: 400px;
    max-height: 400px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.chat-loading {
    flex-grow: 1;
    display: grid;
    place-content: center;
}

.chat-error {
    flex-grow: 1;
    display: grid;
    place-content: center;
    gap: 8px;
    padding: 8px;
    color: var(--text-color-error-accent);

    .chat-reload {
        justify-self: center;
        padding: 4px 8px;
    }
}

.chat-messages {
    padding: 8px;
    overflow-y: auto;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    scrollbar-width: thin;
}

.chat-message {
    word-break: break-word;
}

.chat-message-separator {
    border: none;
    border-top: 1px solid lab(40 0 0);
}

.chat-input {
    border-top: 1px solid white;
    height: 30px;
    flex-shrink: 0;
}
</style>
