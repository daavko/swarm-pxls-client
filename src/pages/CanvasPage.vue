<template>
    <div class="canvas-container">
        <CanvasRenderer></CanvasRenderer>
    </div>
    <CursorInfoAttachment v-if="loggedIn === true"></CursorInfoAttachment>
    <div class="ui">
        <div class="ui-inner ui-inner-top-alert">
            <p v-if="userInfo?.banned" class="ui-ban-alert">You are banned. Ban reason: {{ userInfo.banReason }}</p>
            <p v-if="state !== 'running'" class="ui-connection-alert">
                <template v-if="state === 'beforeFirstConnect'">Not yet connected</template>
                <template v-if="state === 'fetchingInfo'">Loading canvas info...</template>
                <template v-if="state === 'fetchInfoError'">Failed to load canvas info, retrying soon...</template>
                <template v-if="state === 'connectingToSocket'">Connecting to socket...</template>
                <template v-if="state === 'socketConnectionError'">Socket connection error, retrying soon...</template>
                <template v-if="state === 'fetchingBoardData'">Loading canvas data...</template>
                <template v-if="state === 'boardDataFetchError'">Failed to load canvas data, retrying soon...</template>
                <template v-if="state === 'reconnecting'">Reconnecting...</template>
            </p>
        </div>
        <div class="ui-inner ui-inner-top-left">
            <div class="ui-inner--container">
                <CanvasUiButton v-if="loggedIn === true" :iconPath="mdiChatOutline" @click="showChat = !showChat">
                    <template #tooltip>Chat</template>
                </CanvasUiButton>
                <CanvasUiButton :iconPath="mdiBellOutline">
                    <template #tooltip>Alerts</template>
                </CanvasUiButton>
            </div>
            <div class="ui-inner--container">
                <ChatBubble v-if="showChat"></ChatBubble>
            </div>
        </div>
        <div class="ui-inner ui-inner-top-right ui-inner--container">
            <CanvasUiButton :iconPath="mdiLockOpenOutline">
                <template #tooltip>Lock canvas view</template>
            </CanvasUiButton>
            <CanvasUiButton :iconPath="mdiInformationOutline">
                <template #tooltip>Info</template>
            </CanvasUiButton>
            <CanvasUiButton :iconPath="mdiHelpCircleOutline">
                <template #tooltip>Frequently asked questions</template>
            </CanvasUiButton>
            <CanvasUiButton :iconPath="mdiCog">
                <template #tooltip>Settings</template>
            </CanvasUiButton>
        </div>
        <div class="ui-inner ui-inner-bottom-left ui-inner--container">
            <CanvasInfoBubble></CanvasInfoBubble>
        </div>
        <div class="ui-inner ui-inner-bottom-right ui-inner--container">
            <PaletteBar v-if="loggedIn === true"></PaletteBar>
        </div>
        <div class="ui-inner ui-inner-bottom-alert">
            <div v-if="info && loggedIn === false" class="ui-auth-alert">
                <p><a @click.prevent="openAuthDialog">Log in / register</a> to place pixels.</p>
                <p>
                    <small
                        >By logging in or registering, you agree to the
                        <a :href="info.legal.termsUrl" target="_blank">terms of use</a> and
                        <a :href="info.legal.privacyUrl" target="_blank">privacy policy</a> of Pxls.</small
                    >
                </p>
                <p>
                    <small>This is an <strong>unofficial</strong> Pxls canvas client.</small>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useCanvasViewportStore } from '@/core/canvas-renderer/canvas-viewport.store.ts';
import CanvasRenderer from '@/core/canvas-renderer/CanvasRenderer.vue';
import { useCanvasStore } from '@/core/canvas/canvas.store.ts';
import CanvasInfoBubble from '@/core/canvas/CanvasInfoBubble.vue';
import CanvasUiButton from '@/core/canvas/CanvasUiButton.vue';
import CursorInfoAttachment from '@/core/canvas/CursorInfoAttachment.vue';
import PaletteBar from '@/core/canvas/PaletteBar.vue';
import ChatBubble from '@/core/chat/ChatBubble.vue';
import { useDialog } from '@/core/dialog/dialog.store.ts';
import AuthDialog from '@/core/session/AuthDialog.vue';
import AuthFinishDialog from '@/core/session/AuthFinishDialog.vue';
import { useSession, useTypeAssistedSessionUserInfo } from '@/core/session/session.store.ts';
import { useSessionAuthFlowStorage } from '@/core/session/use-session-auth-flow-storage.ts';
import { useIntegerQueryParam } from '@/utils/router.ts';
import {
    mdiBellOutline,
    mdiChatOutline,
    mdiCog,
    mdiHelpCircleOutline,
    mdiInformationOutline,
    mdiLockOpenOutline,
} from '@mdi/js';
import { useTitle } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const { state, info } = storeToRefs(useCanvasStore());
const { scheduleImmediateReconnect } = useCanvasStore();
const { loggedIn, availablePixels, cooldown, formattedCooldown } = storeToRefs(useSession());
const userInfo = useTypeAssistedSessionUserInfo();
const { createDialog } = useDialog();
const authFlowStorage = useSessionAuthFlowStorage();
const route = useRoute();
const router = useRouter();
const { pan, scale } = storeToRefs(useCanvasViewportStore());

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

function openAuthDialog(): void {
    if (!info.value) {
        return;
    }

    createDialog({
        content: { component: AuthDialog, props: { authServices: info.value.authServices } },
    });
}
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

    &.ui-inner-top-alert {
        grid-area: top-alert;
        user-select: none;
        text-align: center;

        @media (width > 768px) {
            grid-area: top-left / top-left / top-right / top-right;
            place-self: start center;
            width: 40%;

            > *:last-child {
                border-bottom-left-radius: 8px;
                border-bottom-right-radius: 8px;
            }
        }
    }

    &.ui-inner-bottom-alert {
        grid-area: bottom-alert;
        user-select: none;
        text-align: center;

        @media (width > 768px) {
            grid-area: bottom-left / bottom-left / bottom-right / bottom-right;
            place-self: end center;
            width: 40%;

            > *:first-child {
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
            }
        }
    }

    &.ui-inner-top-left {
        grid-area: top-left;
        place-self: start start;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    &.ui-inner-top-right {
        grid-area: top-right;
        place-self: start end;
    }

    &.ui-inner-bottom-left {
        grid-area: bottom-left;
        place-self: end start;
    }

    &.ui-inner-bottom-right {
        grid-area: bottom-right;
        place-self: end end;
    }

    & > * {
        pointer-events: auto;
    }
}

.ui-inner--container {
    display: flex;
    gap: 8px;
}

.ui-ban-alert {
    padding: 8px;
    background: var(--bg-color-error);
    color: var(--text-color-error);
}

.ui-connection-alert {
    padding: 8px;
    background: var(--bg-color-warning);
    color: var(--text-color-warning);
}

.ui-auth-alert {
    padding: 16px;
    background-color: var(--panel-bg-color);
    color: var(--panel-text-color);
}
</style>
