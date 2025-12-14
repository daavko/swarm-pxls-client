import { segmentRawChatMessage } from '@/core/chat/message-segmenter.ts';
import type { ChatMessage } from '@/core/chat/types.ts';
import { logError } from '@/core/logger/error-log.ts';
import type { ApiResponse, ApiSuccessResponse } from '@/core/pxls-api/api-fetch.ts';
import type { ApiRequestState } from '@/core/pxls-api/api-request-state.ts';
import { PxlsApi } from '@/core/pxls-api/pxls-api.ts';
import type { ChatHistoryResponse } from '@/core/pxls-api/schemas/chat-history.ts';
import { usePxlsSocketMessageEventBus } from '@/core/pxls-socket/use-pxls-socket.ts';
import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

const MESSAGE_LIMIT = 100;

function sortAndSliceMessages(messages: ChatMessage[], limit: number): ChatMessage[] {
    return messages.sort((a, b) => a.id - b.id).slice(-limit);
}

export const useChatStore = defineStore('chat', () => {
    const messages = ref<ChatMessage[]>([]);
    const loadState = ref<ApiRequestState>('idle');

    const socketMessageEventBus = usePxlsSocketMessageEventBus();

    socketMessageEventBus.on((message) => {
        if (message.type === 'chat_message') {
            const { message: rawMessage } = message;
            const chatMessage: ChatMessage = {
                ...rawMessage,
                segments: segmentRawChatMessage(rawMessage),
            };
            messages.value = sortAndSliceMessages([...messages.value, chatMessage], MESSAGE_LIMIT);
        }
    });

    async function fetchChatHistory(): Promise<ApiSuccessResponse<ChatHistoryResponse> | null> {
        let chatHistoryResponse: ApiResponse<ChatHistoryResponse>;
        try {
            chatHistoryResponse = await PxlsApi.chatHistory();
        } catch (e) {
            logError(e);
            return null;
        }

        if (chatHistoryResponse.success) {
            return chatHistoryResponse;
        } else {
            logError(chatHistoryResponse.error);
            return null;
        }
    }

    async function loadChatHistory(): Promise<void> {
        if (loadState.value === 'loading' || loadState.value === 'success') {
            return;
        }

        loadState.value = 'loading';

        const response = await fetchChatHistory();
        if (!response) {
            loadState.value = 'error';
            return;
        }

        messages.value = sortAndSliceMessages(
            [
                ...messages.value,
                ...response.data.map((rawMessage) => ({
                    ...rawMessage,
                    segments: segmentRawChatMessage(rawMessage),
                })),
            ],
            MESSAGE_LIMIT,
        );

        loadState.value = 'success';
    }

    return {
        messages: readonly(messages),
        loadState: readonly(loadState),
        loadChatHistory,
    };
});
