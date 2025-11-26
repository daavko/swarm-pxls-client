import { computed, type ComputedRef, readonly, type Ref, shallowRef, triggerRef } from 'vue';

interface Logger<EntryType, LogInputType> {
    entries: Ref<EntryType[]>;
    log: (input: LogInputType) => void;
    useEntries: () => ComputedRef<ReturnType<typeof readonly<EntryType[]>>>;
}

export function createLogger<EntryType, LogInputType>(
    maxEntries: number,
    loggerEnabled: () => boolean,
    createEntry: (input: LogInputType) => EntryType,
    logAction: (entry: EntryType) => void,
): Logger<EntryType, LogInputType> {
    const entries = shallowRef<EntryType[]>([]);

    const log = (input: LogInputType): void => {
        if (!loggerEnabled()) {
            return;
        }

        const entry = createEntry(input);
        logAction(entry);

        if (entries.value.length >= maxEntries) {
            entries.value.shift();
        }

        entries.value.push(entry);
        triggerRef(entries);
    };

    const useEntries = (): ComputedRef<ReturnType<typeof readonly<EntryType[]>>> =>
        computed(() => readonly(entries.value));

    return {
        entries,
        log,
        useEntries,
    };
}
