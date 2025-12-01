import type { Dialog, DialogContent, DialogHandle, OpenDialogOptions } from '@/core/dialog/types.ts';
import { defineStore } from 'pinia';
import { type Component, markRaw, ref } from 'vue';

const DEFAULT_DIALOG_OPTIONS: Omit<Required<OpenDialogOptions>, 'title' | 'content'> = {
    closeOnBackdropClick: true,
    closeOnEscape: true,
    backdrop: true,
    noCloseButton: false,
    size: 'medium',
};

function normalizeContent<T extends Component>(optionsContent: OpenDialogOptions<T>['content']): DialogContent {
    if (typeof optionsContent === 'string') {
        return {
            type: 'text',
            text: optionsContent,
        };
    } else if (optionsContent instanceof DocumentFragment) {
        return {
            type: 'documentFragment',
            html: optionsContent,
        };
    } else {
        return {
            type: 'component',
            component: markRaw(optionsContent.component),
            props: optionsContent.props,
        };
    }
}

export const useDialog = defineStore('dialog', () => {
    const openDialogs = ref<Dialog[]>([]);

    function createDialog(options: OpenDialogOptions): DialogHandle {
        const id = Symbol('dialog-id');

        const { title, content, backdrop, closeOnBackdropClick, closeOnEscape, noCloseButton, size } = {
            ...DEFAULT_DIALOG_OPTIONS,
            ...options,
        };

        const dialog: Dialog = {
            id,
            title,
            content: normalizeContent(content),
            backdrop,
            closeOnBackdropClick,
            closeOnEscape,
            closeButton: !noCloseButton,
            size,
        };
        openDialogs.value.push(dialog);

        return {
            close: () => {
                closeDialog(id);
            },
        };
    }

    function closeDialog(id: symbol): void {
        openDialogs.value = openDialogs.value.filter((dialog) => dialog.id !== id);
    }

    return { openDialogs, createDialog, closeDialog };
});
