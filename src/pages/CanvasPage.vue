<template>
    <div class="canvas-container">
        <CanvasRenderer></CanvasRenderer>
    </div>
    <CursorInfoAttachment v-if="showInfoAttachment"></CursorInfoAttachment>
    <CanvasUiTop></CanvasUiTop>
    <CanvasUiBottom></CanvasUiBottom>
    <div class="ui">
        <div class="ui-inner ui-inner-top-left">
            <div class="ui-inner--container">
                <CanvasUiButton
                    v-if="loggedIn === true"
                    :iconPath="mdiChatOutline"
                    @click="showChat = !showChat"></CanvasUiButton>
                <CanvasUiButton :iconPath="mdiBellOutline"></CanvasUiButton>
            </div>
            <div class="ui-inner--container">
                <ChatBubble v-if="showChat"></ChatBubble>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useCanvasViewportStore } from '@/core/canvas-renderer/canvas-viewport.store.ts';
import CanvasRenderer from '@/core/canvas-renderer/CanvasRenderer.vue';
import { useCanvasStore } from '@/core/canvas/canvas.store.ts';
import CanvasUiBottom from '@/core/canvas/CanvasUiBottom.vue';
import CanvasUiButton from '@/core/canvas/CanvasUiButton.vue';
import CanvasUiTop from '@/core/canvas/CanvasUiTop.vue';
import CursorInfoAttachment from '@/core/canvas/CursorInfoAttachment.vue';
import ChatBubble from '@/core/chat/ChatBubble.vue';
import { useDialog } from '@/core/dialog/dialog.store.ts';
import AuthFinishDialog from '@/core/session/AuthFinishDialog.vue';
import { useSession } from '@/core/session/session.store.ts';
import { useSessionAuthFlowStorage } from '@/core/session/use-session-auth-flow-storage.ts';
import { useIntegerQueryParam } from '@/utils/router.ts';
import { mdiBellOutline, mdiChatOutline } from '@mdi/js';
import { useMediaQuery, useTitle } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const { state, info } = storeToRefs(useCanvasStore());
const { scheduleImmediateReconnect } = useCanvasStore();
const { loggedIn, availablePixels, cooldown, formattedCooldown } = storeToRefs(useSession());
const { createDialog } = useDialog();
const authFlowStorage = useSessionAuthFlowStorage();
const route = useRoute();
const router = useRouter();
const { pan, scale } = storeToRefs(useCanvasViewportStore());

const browserCanHover = useMediaQuery('(hover: hover)');
const showInfoAttachment = computed(() => loggedIn.value === true && browserCanHover.value);

const showChat = ref(false);
const pageTitle = computed(() => {
    if (info.value && loggedIn.value === true) {
        if (cooldown.value != null) {
            return `[${formattedCooldown.value}] - Unofficial Pxls Client`;
        } else {
            return `[${availablePixels.value ?? 0}/${info.value.maxStacked}] - Unofficial Pxls Client`;
        }
    } else {
        return 'Unofficial Pxls Client';
    }
});

useTitle(pageTitle);

onBeforeMount(() => {
    if (state.value === 'beforeFirstConnect') {
        void scheduleImmediateReconnect('beforeFirstConnect');
    }
});

onMounted(() => {
    if (authFlowStorage.value) {
        createDialog({
            content: { component: AuthFinishDialog },
            closeOnEscape: false,
            closeOnBackdropClick: false,
            noCloseButton: true,
        });
    }

    const queryX = useIntegerQueryParam('x');
    const queryY = useIntegerQueryParam('y');
    if (queryX.value != null && queryY.value != null && pan != null) {
        pan.value = { x: queryX.value, y: queryY.value };
    }

    const queryScale = useIntegerQueryParam('scale');
    if (queryScale.value != null) {
        scale.value = queryScale.value;
    }

    void router.replace({ query: { ...route.query, x: undefined, y: undefined, scale: undefined } });
});
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
    display: none;
    grid-template-columns: minmax(0, auto) 1fr minmax(0, auto);
    grid-template-rows: minmax(0, auto) minmax(0, auto) 1fr minmax(0, auto) minmax(0, auto);
    grid-template-areas:
        'top-alert top-alert top-alert'
        'top-left . top-right'
        '. . .'
        'bottom-left . bottom-right'
        'bottom-alert bottom-alert bottom-alert';
}

.ui-inner {
    padding: 8px;

    &.ui-inner-top-left {
        grid-area: top-left;
        place-self: start start;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
}

.ui-inner--container {
    display: flex;
    gap: 8px;
}
</style>
