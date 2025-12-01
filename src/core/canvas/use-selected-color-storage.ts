import { type RemovableRef, StorageSerializers, useLocalStorage } from '@vueuse/core';

export function useSelectedColorStorage(): RemovableRef<number | null> {
    return useLocalStorage<number | null>('selected-color-index', null, {
        serializer: StorageSerializers.number,
        flush: 'sync',
    });
}
