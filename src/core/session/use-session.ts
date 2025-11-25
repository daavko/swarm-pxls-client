import type { UserinfoMessage } from '@/core/socket-client/schemas/message-schemas.ts';
import { CANVAS_SOCKET_MESSAGE_BUS_KEY } from '@/core/socket-client/use-canvas-socket.ts';
import { useEventBus, useLocalStorage } from '@vueuse/core';
import { defineStore, storeToRefs } from 'pinia';
import { computed, readonly, ref } from 'vue';

export type UserInfo = UserinfoMessage;

const useSessionInternal = defineStore('session-internal', () => {
    const userInfo = ref<UserInfo | null>(null);

    return { userInfo };
});

const useSession = defineStore('session', () => {
    const canvasSocketMessageBus = useEventBus(CANVAS_SOCKET_MESSAGE_BUS_KEY);
    const loginStateStorage = useLocalStorage('session-login', false);
    const { userInfo } = storeToRefs(useSessionInternal());

    canvasSocketMessageBus.on((message) => {
        if (message.type === 'userinfo') {
            // todo: login message, save state
        }
    });

    function login(providerId: string): void {
        // todo: login flow
    }

    function signup(providerId: string): void {
        // todo: signup flow (iirc same as login flow since it all uses oauth, but who knows)
    }

    function logout(): void {
        // todo: perform logout
    }

    return {
        userInfo: computed(() => readonly(userInfo)),
        login,
        signup,
        logout,
    };
});
