<template>
    <div class="ui-bottom">
        <div class="info-container">
            <CanvasInfoBubble></CanvasInfoBubble>
        </div>
        <div class="palette-container">
            <PaletteBar v-if="loggedIn === true"></PaletteBar>
        </div>
        <div class="alerts">
            <div v-if="info && loggedIn === false" class="alert alert-auth">
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
import { useCanvasStore } from '@/core/canvas/canvas.store.ts';
import CanvasInfoBubble from '@/core/canvas/CanvasInfoBubble.vue';
import PaletteBar from '@/core/canvas/PaletteBar.vue';
import { useDialog } from '@/core/dialog/dialog.store.ts';
import AuthDialog from '@/core/session/AuthDialog.vue';
import { useSession } from '@/core/session/session.store.ts';
import { storeToRefs } from 'pinia';

const { info } = storeToRefs(useCanvasStore());
const { loggedIn } = storeToRefs(useSession());
const { createDialog } = useDialog();

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
.ui-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    pointer-events: none;
    display: grid;
    grid-template-columns: minmax(0, auto) minmax(0, 1fr) minmax(0, min-content);
    grid-template-rows: minmax(0, auto) minmax(0, auto);
    grid-template-areas:
        'info . palette'
        'alerts alerts alerts';
    align-items: end;

    @media (width >= 960px) {
        grid-template-columns: minmax(0, auto) minmax(0, 1fr) minmax(0, auto);
        grid-template-rows: minmax(0, auto);
        grid-template-areas: 'info . palette';
    }
}

.info-container {
    grid-area: info;
    margin: 8px;

    & > :deep(*) {
        pointer-events: auto;
    }
}

.palette-container {
    grid-area: palette;
    margin: 8px;

    & > :deep(*) {
        pointer-events: auto;
    }
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
        grid-area: info / info / palette / palette;
    }

    @media (width >= 1280px) {
        width: 700px;
    }
}

.alert {
    padding: 8px;
    text-align: center;

    @media (width >= 960px) {
        &:last-child {
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
    }
}

.alert-auth {
    padding: 16px;
    background-color: var(--panel-bg-color);
    color: var(--panel-text-color);
}
</style>
