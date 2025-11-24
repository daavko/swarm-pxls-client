import { useGeneralSettings } from '@/core/settings/use-general-settings.ts';
import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

interface DebugLogEntry {
    timestamp: Date;
    message: string;
}

const useDebugLoggerInternal = defineStore('debug-logger-internal', () => {
    const log = ref<DebugLogEntry[]>([]);

    return {
        log,
    };
});

export const useDebugLogger = defineStore('debug-logger', () => {
    const generalSettings = useGeneralSettings();
    const internalStore = useDebugLoggerInternal();

    function logDebugMessage(message: string): void {
        if (!generalSettings.value.debugLogging) {
            return;
        }
        const debugEntry: DebugLogEntry = { timestamp: new Date(), message };
        console.debug(`${debugEntry.timestamp.toISOString()}: ${debugEntry.message}`);
        if (internalStore.log.length >= 1000) {
            internalStore.log.shift();
        }
        internalStore.log.push(debugEntry);
    }
    return {
        log: computed(() => readonly(internalStore.log)),
        logDebugMessage,
    };
});
