import { useGeneralSettings } from '@/core/settings/use-general-settings.ts';
import { defineStore } from 'pinia';
import { computed, readonly, shallowRef } from 'vue';

interface ErrorLogEntry {
    timestamp: Date;
    error: unknown;
}

const useErrorLoggerInternal = defineStore('error-logger-internal', () => {
    const log = shallowRef<ErrorLogEntry[]>([]);

    return {
        log,
    };
});

export const useErrorLogger = defineStore('error-logger', () => {
    const generalSettings = useGeneralSettings();
    const internalStore = useErrorLoggerInternal();

    function logError(error: unknown): void {
        if (!generalSettings.value.errorLogging) {
            return;
        }
        const errorEntry: ErrorLogEntry = { timestamp: new Date(), error };
        console.error(`${errorEntry.timestamp.toISOString()}:`, errorEntry.error);
        if (internalStore.log.length >= 1000) {
            internalStore.log.shift();
        }
        internalStore.log.push(errorEntry);
    }

    return {
        log: computed(() => readonly(internalStore.log)),
        logError,
    };
});
