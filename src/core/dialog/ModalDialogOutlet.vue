<template>
    <div class="dialog-outlet">
        <template v-for="dialog in openDialogs" :key="dialog.id">
            <div class="dialog-container">
                <ModalDialog class="dialog"></ModalDialog>
                <div
                    v-if="dialog.options.backdrop"
                    class="dialog-backdrop"
                    @click.prevent="backdropClick(dialog)"></div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import ModalDialog from '@/core/dialog/ModalDialog.vue';
import { type Dialog, useDialog } from '@/core/dialog/use-dialog.ts';
import { storeToRefs } from 'pinia';
import { watchEffect } from 'vue';

const { openDialogs } = storeToRefs(useDialog());
const { closeDialog } = useDialog();

watchEffect(() => {
    if (openDialogs.value.length > 0) {
        document.body.classList.add('modal-dialog-open');
    } else {
        document.body.classList.remove('modal-dialog-open');
    }
});

function backdropClick(dialog: Dialog): void {
    if (dialog.options.closeOnBackdropClick === true) {
        closeDialog(dialog.id);
    }
}
</script>

<style scoped>
.dialog-outlet {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1000;
}

.dialog-container {
    position: absolute;
    inset: 0;
}

.dialog-backdrop {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.4);
    pointer-events: all;
}

.dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: all;
}
</style>

<style>
.modal-dialog-open {
    overflow: hidden;
}
</style>
