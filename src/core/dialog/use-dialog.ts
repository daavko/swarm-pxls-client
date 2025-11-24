import { defineStore } from 'pinia';
import type { DialogButton, DialogHandle, DialogReturnType, OpenDialogOptions } from '@/core/dialog/types.ts';

export const useDialog = defineStore('dialog', () => {
    function createDialog<T extends readonly DialogButton<unknown>[]>(
        options: OpenDialogOptions,
        buttons?: T,
    ): DialogHandle<DialogReturnType<T>> {
        // Implementation would go here
        throw new Error('Not implemented');
    }
});
