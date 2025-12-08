<template>
    <div class="canvas-container">
        <CanvasRenderer></CanvasRenderer>
    </div>
    <CursorInfoAttachment v-if="loggedIn"></CursorInfoAttachment>
    <div class="ui">
        <div class="ui-inner ui-inner-top-alert">
            <p v-if="userInfo?.banned" class="ui-ban-alert">You are banned. Ban reason: {{ userInfo.banReason }}</p>
            <p v-if="state !== 'running'" class="ui-connection-alert">
                <template v-if="state === 'beforeFirstConnect'">Not yet connected</template>
                <template v-if="state === 'fetchingInfo'">Fetching info...</template>
                <template v-if="state === 'fetchInfoError'">Fetch info error, retrying soon...</template>
                <template v-if="state === 'connectingToSocket'">Connecting to socket...</template>
                <template v-if="state === 'socketConnectionError'">Socket connection error, retrying soon...</template>
                <template v-if="state === 'fetchingBoardData'">Fetching board data...</template>
                <template v-if="state === 'boardDataFetchError'">Board data fetch error, retrying soon...</template>
                <template v-if="state === 'reconnecting'">Reconnecting...</template>
            </p>
        </div>
        <div class="ui-inner ui-inner-top-left ui-inner--container">
            <CanvasUiButton :iconPath="mdiInformationOutline"></CanvasUiButton>
            <CanvasUiButton :iconPath="mdiHelpCircleOutline"></CanvasUiButton>
            <CanvasUiButton :iconPath="mdiBellOutline"></CanvasUiButton>
        </div>
        <div class="ui-inner ui-inner-top-right ui-inner--container">
            <CanvasUiButton :iconPath="mdiLockOpenOutline"></CanvasUiButton>
            <CanvasUiButton :iconPath="mdiCog"></CanvasUiButton>
            <CanvasUiButton :iconPath="mdiChatOutline"></CanvasUiButton>
        </div>
        <div class="ui-inner ui-inner-bottom-left ui-inner--container">
            <CanvasInfoBubble></CanvasInfoBubble>
        </div>
        <div class="ui-inner ui-inner-bottom-right ui-inner--container">
            <PaletteBar v-if="loggedIn"></PaletteBar>
        </div>
        <div class="ui-inner ui-inner-bottom-alert">
            <div v-if="info && !loggedIn" class="ui-auth-alert">
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
import { useDialog } from '@/core/dialog/dialog.store.ts';
import AuthDialog from '@/core/session/AuthDialog.vue';
import AuthFinishDialog from '@/core/session/AuthFinishDialog.vue';
import { useSession, useTypeAssistedSessionUserInfo } from '@/core/session/session.store.ts';
import { useSessionAuthFlowStorage } from '@/core/session/use-session-auth-flow-storage.ts';
import { useCooldownFormat } from '@/utils/format.ts';
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
import { computed, onBeforeMount, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const { state, info } = storeToRefs(useCanvasStore());
const { scheduleImmediateReconnect } = useCanvasStore();
const { loggedIn, availablePixels, cooldown } = storeToRefs(useSession());
const userInfo = useTypeAssistedSessionUserInfo();
const { createDialog } = useDialog();
const authFlowStorage = useSessionAuthFlowStorage();
const route = useRoute();
const router = useRouter();
const { pan, scale } = storeToRefs(useCanvasViewportStore());

const cooldownMilliseconds = computed(() => cooldown.value?.millisecondsLeft);
const formattedCooldown = useCooldownFormat(cooldownMilliseconds, false);
const pageTitle = computed(() => {
    if (info.value && loggedIn.value) {
        if (cooldownMilliseconds.value != null) {
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

    &.ui-inner--container {
        display: flex;
        gap: 8px;
        padding: 8px;
    }

    > * {
        pointer-events: auto;
    }
}

.ui-ban-alert {
    padding: 8px;
    background: #b00000;
    color: white;
}

.ui-connection-alert {
    padding: 8px;
    background: #f39b16;
}

.ui-auth-alert {
    padding: 16px;
    background: rgba(0, 0, 0, 0.85);
    color: white;
}
</style>
