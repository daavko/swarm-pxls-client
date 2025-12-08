import type { ApiRequestState } from '@/core/pxls-api/api-request-state.ts';
import { PxlsApi } from '@/core/pxls-api/pxls-api.ts';
import { usePxlsSocketMessageEventBus } from '@/core/pxls-socket/use-pxls-socket.ts';
import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

export const useUsersStore = defineStore('users', () => {
    const canvasSocketMessageBus = usePxlsSocketMessageEventBus();

    const usersLoadState = ref<ApiRequestState>('idle');
    const userCount = ref<number | null>(null);

    canvasSocketMessageBus.on((message) => {
        if (message.type === 'users') {
            userCount.value = message.count;
            usersLoadState.value = 'success';
        }
    });

    async function loadUserCount(): Promise<void> {
        if (userCount.value != null || usersLoadState.value === 'loading' || usersLoadState.value === 'success') {
            return;
        }

        usersLoadState.value = 'loading';

        const response = await PxlsApi.users();
        if (response.success) {
            userCount.value = response.data.count;
            usersLoadState.value = 'success';
        } else {
            usersLoadState.value = 'error';
        }
    }

    return {
        userCount: readonly(userCount),
        usersLoadState: readonly(usersLoadState),
        loadUserCount,
    };
});
