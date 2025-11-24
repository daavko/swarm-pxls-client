<template>
    <div class="canvas-container"></div>
    <div class="ui">
        <div class="ui-inner ui-inner--container ui-inner--top-left">
            <CanvasUiButton :iconPath="mdiInformationOutline"></CanvasUiButton>
            <CanvasUiButton :iconPath="mdiHelpCircleOutline"></CanvasUiButton>
            <CanvasUiButton :iconPath="mdiBellOutline"></CanvasUiButton>
        </div>
        <div class="ui-inner ui-inner--container ui-inner--top-right">
            <CanvasUiButton :iconPath="mdiLockOpenOutline"></CanvasUiButton>
            <CanvasUiButton :iconPath="mdiCog"></CanvasUiButton>
            <CanvasUiButton :iconPath="mdiChatOutline"></CanvasUiButton>
        </div>
        <div class="ui-inner ui-inner--container ui-inner--bottom-left">
            <CanvasInfoBubble></CanvasInfoBubble>
        </div>
        <div class="ui-inner ui-inner--container ui-inner--bottom-right"></div>
        <div class="ui-inner ui-inner--bottom">
            <PaletteBar></PaletteBar>
        </div>
    </div>
</template>

<script setup lang="ts">
import CanvasInfoBubble from '@/core/canvas/CanvasInfoBubble.vue';
import CanvasUiButton from '@/core/canvas/CanvasUiButton.vue';
import PaletteBar from '@/core/canvas/PaletteBar.vue';
import {
    mdiBellOutline,
    mdiChatOutline,
    mdiCog,
    mdiHelpCircleOutline,
    mdiInformationOutline,
    mdiLockOpenOutline,
} from '@mdi/js';
</script>

<style scoped>
.canvas-container {
    width: 100dvw;
    height: 100dvh;
}

.ui {
    position: fixed;
    inset: 0;
    pointer-events: none;
    display: grid;
    grid-template-columns: minmax(0, auto) 1fr minmax(0, auto);
    grid-template-rows: minmax(0, auto) 1fr minmax(0, auto) minmax(0, auto);
    grid-template-areas:
        'top-left . top-right'
        '. . .'
        'bottom-left . bottom-right'
        'bottom bottom bottom';

    .ui-inner {
        &.ui-inner--top-left {
            grid-area: top-left;
        }

        &.ui-inner--top-right {
            grid-area: top-right;
        }

        &.ui-inner--bottom-left {
            grid-area: bottom-left;
        }

        &.ui-inner--bottom-right {
            grid-area: bottom-right;
        }

        &.ui-inner--bottom {
            grid-area: bottom;
        }

        &.ui-inner--container {
            display: flex;
            gap: 8px;
            padding: 8px;
        }

        > * {
            pointer-events: auto;
        }
    }
}
</style>
