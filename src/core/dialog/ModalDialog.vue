<template>
    <div
        class="dialog"
        :class="{
            'dialog--small': dialog.size === 'small',
            'dialog--medium': dialog.size === 'medium',
            'dialog--large': dialog.size === 'large',
        }">
        <MdiIconButton
            v-if="dialog.closeButton"
            class="dialog-close"
            :iconPath="mdiClose"
            :size="32"
            @click="closeDialog(dialog.id)"></MdiIconButton>
        <div class="dialog-content">
            <template v-if="textContent">
                <h2 class="dialog-title" v-if="dialog.title">{{ dialog.title }}</h2>
                <p class="dialog-text">{{ textContent.text }}</p>
            </template>
            <template v-if="documentFragmentContent">
                <div class="dialog-dynamic-content" v-html="documentFragmentContent.html"></div>
            </template>
            <template v-if="componentContent">
                <component :is="componentContent.component" v-bind="componentContent.props" />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import MdiIconButton from '@/core/common/MdiIconButton.vue';
import { useDialog } from '@/core/dialog/dialog.store.ts';
import { CURRENT_DIALOG } from '@/core/dialog/injection-symbols.ts';
import type { Dialog } from '@/core/dialog/types.ts';
import { mdiClose } from '@mdi/js';
import { computed, provide } from 'vue';

const { closeDialog } = useDialog();

const props = defineProps<{
    dialog: Dialog;
}>();

provide(CURRENT_DIALOG, props.dialog);

const textContent = computed(() => {
    if (props.dialog.content.type === 'text') {
        return props.dialog.content;
    }
    return null;
});
const documentFragmentContent = computed(() => {
    if (props.dialog.content.type === 'documentFragment') {
        return props.dialog.content;
    }
    return null;
});
const componentContent = computed(() => {
    if (props.dialog.content.type === 'component') {
        return props.dialog.content;
    }
    return null;
});
</script>

<style scoped>
.dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: all;

    display: flex;
    flex-direction: column;

    background-color: black;
    color: white;
    border: 2px solid white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

    &.dialog--small {
        min-width: min(300px, 90dvw);
        min-height: min(150px, 90dvh);
        max-width: min(500px, 90dvw);
        max-height: min(250px, 90dvh);
    }

    &.dialog--medium {
        min-width: min(500px, 90dvw);
        min-height: min(250px, 90dvh);
        max-width: min(800px, 90dvw);
        max-height: min(400px, 90dvh);
    }

    &.dialog--large {
        min-width: min(800px, 90dvw);
        min-height: min(400px, 90dvh);
        max-width: 90dvw;
        max-height: 90dvh;
    }
}

.dialog-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 16px;
    overflow: auto;
}

.dialog-title {
    text-align: center;
    margin-bottom: 16px;
}

.dialog-dynamic-content {
    display: contents;
}

.dialog-close {
    position: absolute;
    top: 0;
    right: 0;
    width: 40px;
    height: 40px;
    color: red;
}
</style>
