import type { Component } from 'vue';

export type DialogSize = 'small' | 'medium' | 'large';

export interface OpenDialogOptions<T extends Component = Component> {
    title?: string;
    content:
        | string
        | DocumentFragment
        | {
              component: T;
              props?: T extends Component<infer P> ? P : never;
          };
    backdrop?: boolean;
    closeOnBackdropClick?: boolean;
    closeOnEscape?: boolean;
    noCloseButton?: boolean;
    size?: DialogSize;
}

export interface DialogHandle {
    close: () => void;
}

export interface TextDialogContent {
    type: 'text';
    text: string;
}

export interface DocumentFragmentDialogContent {
    type: 'documentFragment';
    html: DocumentFragment;
}

export interface ComponentDialogContent<T extends Component = Component> {
    type: 'component';
    component: T;
    props?: T extends Component<infer P> ? P : never;
}

export type DialogContent = TextDialogContent | DocumentFragmentDialogContent | ComponentDialogContent;

export interface Dialog {
    id: symbol;
    title?: string;
    content: DialogContent;
    backdrop: boolean;
    closeOnBackdropClick: boolean;
    closeOnEscape: boolean;
    closeButton: boolean;
    size: DialogSize;
}
