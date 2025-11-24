import { useLocalStorage } from '@vueuse/core';
import type { Ref } from 'vue';

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
    generalSettingsRef ??= useLocalStorage('general-settings', DEFAULT_GENERAL_SETTINGS, { mergeDefaults: true });
    return generalSettingsRef;
}
