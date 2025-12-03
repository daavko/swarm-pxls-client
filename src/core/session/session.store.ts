import { useCanvas } from '@/core/canvas/canvas.store.ts';
import { PxlsApi } from '@/core/pxls-api/pxls-api.ts';
import type { UserinfoMessage } from '@/core/pxls-socket/schemas/message-schemas.ts';
import { useSessionAuthFlowStorage } from '@/core/session/use-session-auth-flow-storage.ts';
import { useRafFn } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, type ComputedRef, type DeepReadonly, ref } from 'vue';
import { usePxlsSocketMessageEventBus } from '@/core/pxls-socket/use-pxls-socket.ts';

export type UserInfo = Omit<UserinfoMessage, 'type'>;

export interface PixelCooldown {
    startedAt: Date;
    endsAt: Date;
    millisecondsLeft: number;
}

export const useSession = defineStore('session', () => {
    const canvasSocketMessageBus = usePxlsSocketMessageEventBus();
    const authFlowStorage = useSessionAuthFlowStorage();
    const { scheduleImmediateReconnect } = useCanvas();

    const cooldownTickerWorker = new Worker(new URL('@/workers/cooldown-ticker.worker.ts', import.meta.url));
    const cooldownTickerRaf = useRafFn(
        () => {
            cooldownTickerUpdate();
        },
        { immediate: false },
    );

    const userInfo = ref<UserInfo | null>(null);
    const availablePixels = ref<number | null>(null);
    const cooldown = ref<PixelCooldown | null>(null);

    function stopCooldownTicking(): void {
        cooldownTickerWorker.postMessage('stop');
        cooldownTickerRaf.pause();
        cooldown.value = null;
    }

    function startCooldownTicking(): void {
        cooldownTickerWorker.postMessage('start');
        cooldownTickerRaf.resume();
    }

    function cooldownTickerUpdate(): void {
        if (cooldown.value === null) {
            return;
        }

        const millisecondsLeft = cooldown.value.endsAt.getTime() - Date.now();
        if (millisecondsLeft <= 0) {
            stopCooldownTicking();
            if (availablePixels.value !== null) {
                availablePixels.value += 1;
            }
        } else {
            cooldown.value.millisecondsLeft = millisecondsLeft;
        }
    }

    cooldownTickerWorker.onmessage = () => {
        cooldownTickerUpdate();
    };

    canvasSocketMessageBus.on((message) => {
        if (message.type === 'userinfo') {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentionally omit type
            const { type, ...rest } = message;
            userInfo.value = rest;
        } else if (message.type === 'pixels' && userInfo.value !== null) {
            availablePixels.value = message.count;
        } else if (message.type === 'pixelCounts' && userInfo.value !== null) {
            const { pixelCount, pixelCountAllTime } = message;
            userInfo.value.pixelCount = pixelCount;
            userInfo.value.pixelCountAllTime = pixelCountAllTime;
        } else if (message.type === 'cooldown') {
            if (message.wait === 0) {
                // cooldownTickerWorker.postMessage('stop');
                // cooldown.value = null;
                stopCooldownTicking();
            } else {
                // cooldownTickerWorker.postMessage('start');
                startCooldownTicking();
                cooldown.value = {
                    startedAt: new Date(),
                    endsAt: new Date(Date.now() + message.wait * 1000),
                    millisecondsLeft: message.wait * 1000,
                };
            }
        }
    });

    async function startAuthFlow(providerId: string): Promise<boolean> {
        authFlowStorage.value = true;
        const response = await PxlsApi.startAuthFlow(providerId);
        if (response.success) {
            window.open(response.data.url, '_blank', 'noopener');
        }
        return response.success;
    }

    async function finishAuthFlow(
        providerId: string,
        code: string,
        state: string,
    ): Promise<{ success: boolean; signupToken: string | null }> {
        const response = await PxlsApi.finishAuthFlow(providerId, code, state);
        if (response.success) {
            authFlowStorage.value = false;
            const { signup, token } = response.data;
            if (!signup) {
                void scheduleImmediateReconnect('reconnecting');
            }
            return { success: true, signupToken: signup ? token : null };
        }
        return { success: false, signupToken: null };
    }

    async function finishSignup(token: string, username: string, discordUsername?: string): Promise<boolean> {
        const response = await PxlsApi.signup(token, username, discordUsername);
        if (response.success) {
            void scheduleImmediateReconnect('reconnecting');
        }
        return response.success;
    }

    async function logout(): Promise<boolean> {
        const response = await PxlsApi.logout();
        if (response.success) {
            userInfo.value = null;
            availablePixels.value = null;
            void scheduleImmediateReconnect('reconnecting');
        }
        return response.success;
    }

    return {
        userInfo,
        loggedIn: computed(() => userInfo.value !== null),
        availablePixels,
        cooldown,
        startAuthFlow,
        finishAuthFlow,
        finishSignup,
        logout,
    };
});

export function useTypeAssistedSessionUserInfo(): ComputedRef<DeepReadonly<UserInfo> | null> {
    const session = useSession();
    return computed(() => session.userInfo);
}
