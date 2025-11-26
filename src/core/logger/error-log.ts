import { createLogger } from '@/core/logger/log.ts';
import { useGeneralSettings } from '@/core/settings/use-general-settings.ts';

interface ErrorLogEntry {
    timestamp: Date;
    error: unknown;
}

export const { log: logError, useEntries: useErrorLog } = createLogger<ErrorLogEntry, unknown>(
    1000,
    () => {
        return useGeneralSettings().value.errorLogging;
    },
    (error) => {
        return { timestamp: new Date(), error };
    },
    (entry) => {
        console.error(`${entry.timestamp.toISOString()}:`, entry.error);
    },
);
