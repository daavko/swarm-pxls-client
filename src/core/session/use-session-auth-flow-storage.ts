import { typedStorageSerializer } from '@/utils/typed-storage-serializer.ts';
import { type RemovableRef, useLocalStorage } from '@vueuse/core';
import * as v from 'valibot';

export function useSessionAuthFlowStorage(): RemovableRef<boolean> {
    return useLocalStorage('session-auth-flow', false, {
        serializer: typedStorageSerializer(v.boolean()),
        flush: 'sync',
    });
}
