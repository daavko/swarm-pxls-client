import { type RemovableRef, useLocalStorage } from '@vueuse/core';

export function useSessionLoginFlowStorage(): RemovableRef<boolean> {
    return useLocalStorage('session-login-flow', false);
}
