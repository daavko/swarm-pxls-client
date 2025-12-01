import { type RemovableRef, useLocalStorage } from '@vueuse/core';

export function useSessionAuthFlowStorage(): RemovableRef<boolean> {
    return useLocalStorage('session-auth-flow', false, { flush: 'sync' });
}
