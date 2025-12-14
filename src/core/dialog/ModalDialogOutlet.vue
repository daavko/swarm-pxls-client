<template>
    <div class="dialog-outlet">
        <template v-for="dialog in openDialogs" :key="dialog.id">
            <div class="dialog-container">
                <div v-if="dialog.backdrop" class="dialog-backdrop" @click.prevent="backdropClick(dialog)"></div>
                <ModalDialog :dialog="dialog"></ModalDialog>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { useDialog } from '@/core/dialog/dialog.store.ts';
import ModalDialog from '@/core/dialog/ModalDialog.vue';
import type { Dialog } from '@/core/dialog/types.ts';
import { useEventListener } from '@vueuse/core';
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

useEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape' && openDialogs.value.length > 0) {
        const topDialog = openDialogs.value[openDialogs.value.length - 1]!;
        if (topDialog.closeOnEscape) {
            closeDialog(topDialog.id);
        }
    }
});

function backdropClick(dialog: Dialog): void {
    if (dialog.closeOnBackdropClick) {
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
    background-color: var(--dialog-backdrop-color);
    pointer-events: all;
}
</style>

<style>
.modal-dialog-open {
    overflow: hidden;
}
</style>
