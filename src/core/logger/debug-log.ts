import { createLogger } from '@/core/logger/log.ts';
import { useGeneralSettings } from '@/core/settings/use-general-settings.ts';

interface DebugLogEntry {
    timestamp: Date;
    message: string;
}

export const { log: logDebugMessage, useEntries: useDebugLog } = createLogger<DebugLogEntry, string>(
    1000,
    () => {
        return useGeneralSettings().value.debugLogging;
    },
    (message) => {
        return { timestamp: new Date(), message };
    },
    (entry) => {
        console.debug(`${entry.timestamp.toISOString()}: ${entry.message}`);
    },
);
