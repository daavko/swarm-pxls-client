<template>
    <router-view></router-view>
    <ModalDialogOutlet></ModalDialogOutlet>
</template>

<script setup lang="ts">
import ModalDialogOutlet from '@/core/dialog/ModalDialogOutlet.vue';
import { useDialog } from '@/core/dialog/dialog.store.ts';
import ModAlertDialog from '@/core/misc/ModAlertDialog.vue';
import { CANVAS_SOCKET_MESSAGE_BUS_KEY } from '@/core/pxls-socket/use-pxls-socket.ts';
import { useEventBus } from '@vueuse/core';

const { createDialog } = useDialog();
const canvasSocketMessageBus = useEventBus(CANVAS_SOCKET_MESSAGE_BUS_KEY);

canvasSocketMessageBus.on((message) => {
    if (message.type === 'alert') {
        createDialog({
            content: {
                component: ModAlertDialog,
                props: {
                    sender: message.sender,
                    message: message.message,
                },
            },
            closeOnEscape: false,
            closeOnBackdropClick: false,
            size: 'small',
        });
    }
});
</script>

<style scoped></style>

<style>
@import 'ress/ress.css';
@import './styles/global.css';
@import './styles/inter.css';
@import './styles/text-utils.css';
@import './styles/utils.css';
</style>
