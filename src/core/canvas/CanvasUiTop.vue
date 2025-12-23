<template>
    <div class="ui-top">
        <div class="buttons buttons-left">
            <CanvasUiButton v-if="loggedIn === true" :iconPath="mdiChatOutline"></CanvasUiButton>
            <CanvasUiButton :iconPath="mdiBellOutline"></CanvasUiButton>
        </div>
        <div class="buttons buttons-right">
            <CanvasUiButton :iconPath="mdiInformationOutline"></CanvasUiButton>
            <CanvasUiButton :iconPath="mdiLockOpenOutline">
                <template #tooltip>Lock canvas view</template>
            </CanvasUiButton>
            <CanvasUiButton :iconPath="mdiImageOutline">
                <template #tooltip>Templates</template>
            </CanvasUiButton>
            <CanvasUiButton :iconPath="mdiCog"></CanvasUiButton>
        </div>
        <div class="alerts">
            <p v-if="userInfo?.banned" class="alert alert--auth">
                You are banned. Ban reason: {{ userInfo.banReason }}
            </p>
            <p v-if="state !== 'running'" class="alert alert--connection">
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
    </div>
</template>

<script setup lang="ts">
import { useCanvasStore } from '@/core/canvas/canvas.store.ts';
import CanvasUiButton from '@/core/canvas/CanvasUiButton.vue';
import { useSession, useTypeAssistedSessionUserInfo } from '@/core/session/session.store.ts';
import {
    mdiBellOutline,
    mdiChatOutline,
    mdiCog,
    mdiImageOutline,
    mdiInformationOutline,
    mdiLockOpenOutline,
} from '@mdi/js';
import { storeToRefs } from 'pinia';

const { state } = storeToRefs(useCanvasStore());
const { loggedIn } = storeToRefs(useSession());
const userInfo = useTypeAssistedSessionUserInfo();
</script>

<style scoped>
.ui-top {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    pointer-events: none;
    display: grid;
    grid-template-columns: minmax(0, auto) 1fr minmax(0, auto);
    grid-template-rows: minmax(0, auto) minmax(0, auto);
    grid-template-areas:
        'alerts alerts alerts'
        'left . right';

    @media (width >= 960px) {
        grid-template-rows: minmax(0, auto);
        grid-template-areas: 'left . right';
    }
}

.buttons {
    display: flex;
    gap: 8px;
    margin: 8px;

    & > :deep(*) {
        pointer-events: auto;
    }
}

.buttons-left {
    grid-area: left;
    justify-content: start;
}

.buttons-right {
    grid-area: right;
    justify-content: end;
}

.alerts {
    grid-area: alerts;
    user-select: none;
    justify-self: center;
    width: 100%;
    font-weight: bold;
    font-size: 1.125rem;

    @media (width >= 960px) {
        width: 500px;
        grid-area: left / left / right / right;
    }

    @media (width >= 1280px) {
        width: 800px;
    }
}

.alert {
    padding: 8px;
    text-align: center;

    @media (width >= 960px) {
        &:last-child {
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
        }
    }
}

.alert--auth {
    background: var(--bg-color-error);
    color: var(--text-color-error);
}

.alert--connection {
    background: var(--bg-color-warning);
    color: var(--text-color-warning);
}
</style>
