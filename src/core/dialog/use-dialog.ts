import type { DialogButton, DialogHandle, DialogReturnType, OpenDialogOptions } from '@/core/dialog/types.ts';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Dialog {
    id: symbol;
    options: OpenDialogOptions;
    buttons: readonly DialogButton<unknown>[];
}

export const useDialog = defineStore('dialog', () => {
    const openDialogs = ref<Dialog[]>([]);

    function createDialog<T extends readonly DialogButton<unknown>[]>(
        options: OpenDialogOptions,
        buttons?: T,
    ): DialogHandle<DialogReturnType<T>> {
        // Implementation would go here
        throw new Error('Not implemented');
    }

    function closeDialog(id: symbol): void {}

    return { openDialogs, createDialog, closeDialog };
});
