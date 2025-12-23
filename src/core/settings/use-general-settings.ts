import { typedStorageSerializer } from '@/utils/typed-storage-serializer.ts';
import { useLocalStorage } from '@vueuse/core';
import * as v from 'valibot';
import type { Ref } from 'vue';

const generalSettingsStorageSchema = v.object({
    debugLogging: v.boolean(),
    errorLogging: v.boolean(),
});

export interface GeneralSettings {
    debugLogging: boolean;
    errorLogging: boolean;
}

const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
    debugLogging: false,
    errorLogging: true,
};

let generalSettingsRef: Ref<GeneralSettings> | undefined;

export function useGeneralSettings(): Ref<GeneralSettings> {
    generalSettingsRef ??= useLocalStorage('general-settings', DEFAULT_GENERAL_SETTINGS, {
        mergeDefaults: true,
        serializer: typedStorageSerializer(generalSettingsStorageSchema),
        flush: 'sync',
    });
    return generalSettingsRef;
}
