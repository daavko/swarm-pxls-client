import { typedStorageSerializer } from '@/utils/typed-storage-serializer.ts';
import { type RemovableRef, useLocalStorage } from '@vueuse/core';
import * as v from 'valibot';

export function useSelectedColorStorage(): RemovableRef<number | null> {
    return useLocalStorage<number | null>('selected-color-index', null, {
        serializer: typedStorageSerializer(v.nullable(v.number())),
        flush: 'sync',
    });
}
