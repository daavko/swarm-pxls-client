export interface DialogButton<TButtonReturnType> {
    label: string;
    returnValue: TButtonReturnType;
}

export interface OpenDialogOptions {
    title?: string;
    content: string | DocumentFragment;
    closeOnBackdropClick?: boolean;
    closeOnEscape?: boolean;
}

export interface DialogHandle<TDialogReturnType> {
    close: () => void;
    waitForClose: () => Promise<TDialogReturnType>;
}

export type DialogReturnType<T extends readonly DialogButton<unknown>[]> = T extends readonly DialogButton<infer R>[]
    ? R
    : never;
