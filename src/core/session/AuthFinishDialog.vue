<template>
    <h2>Finish authentication</h2>
    <div class="auth-link-input">
        <label :for="linkInputId">Authentication link</label>
        <input type="text" autocomplete="off" :id="linkInputId" v-model="authLink" />
    </div>
    <p v-if="showAuthFinishError" class="auth-finish-error">An error occurred</p>
    <div class="finish-auth-buttons">
        <BlockButton class="finish-auth" :disabled="finishButtonDisabled" @click="authFinishButtonClick"
            >Finish login</BlockButton
        >
        <BlockButton class="cancel-auth" :disabled="authFinishInFlight" @click="cancelAuthProcess">Cancel</BlockButton>
    </div>
</template>

<script setup lang="ts">
import BlockButton from '@/core/common/BlockButton.vue';
import { useDialog } from '@/core/dialog/dialog.store.ts';
import { CURRENT_DIALOG } from '@/core/dialog/injection-symbols.ts';
import type { Dialog } from '@/core/dialog/types.ts';
import { useSession } from '@/core/session/session.store.ts';
import { useSessionAuthFlowStorage } from '@/core/session/use-session-auth-flow-storage.ts';
import { promiseInFlightRef } from '@/utils/promise-ref.ts';
import { computed, inject, ref, useId } from 'vue';

const { finishAuthFlow } = useSession();
const authFlowStorage = useSessionAuthFlowStorage();
const { closeDialog } = useDialog();

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- safe
const dialog = inject(CURRENT_DIALOG) as Dialog;

const linkInputId = useId();
const authLink = ref('');
const { updatePromise: updateAuthFinishPromise, inFlight: authFinishInFlight } = promiseInFlightRef();
const finishButtonDisabled = computed(() => {
    return linkToUrl(authLink.value) === null || authFinishInFlight.value;
});
const showAuthFinishError = ref(false);

function linkToUrl(link: string): URL | null {
    try {
        const url = new URL(link);
        if (
            url.origin === 'https://pxls.space' &&
            url.pathname.startsWith('/auth/') &&
            url.searchParams.has('code') &&
            url.searchParams.has('state')
        ) {
            return url;
        } else {
            return null;
        }
    } catch {
        return null;
    }
}

function authFinishButtonClick(): void {
    showAuthFinishError.value = false;
    const authUrl = linkToUrl(authLink.value);
    if (authUrl === null) {
        return;
    }

    const providerId = authUrl.pathname.split('/')[2];
    if (providerId === undefined) {
        return;
    }
    const code = authUrl.searchParams.get('code');
    if (code === null) {
        return;
    }
    const state = authUrl.searchParams.get('state');
    if (state === null) {
        return;
    }

    updateAuthFinishPromise(
        finishAuthFlow(providerId, code, state)
            .then(({ success, signupToken }) => {
                if (!success) {
                    showAuthFinishError.value = true;
                    return;
                }

                if (signupToken !== null) {
                    // todo: open signup dialog
                }

                closeDialog(dialog.id);
            })
            .catch(() => {
                showAuthFinishError.value = true;
            }),
    );
}

function cancelAuthProcess(): void {
    authFlowStorage.value = false;
    closeDialog(dialog.id);
}
</script>

<style scoped>
h2 {
    margin-bottom: 16px;
    text-align: center;
}

.auth-link-input {
    display: flex;
    flex-direction: column;

    input {
        margin-top: 4px;
        padding: 4px;
        border: 1px solid white;
        color: white;
    }
}

.auth-finish-error {
    margin-top: 8px;
    color: #ff7f7f;
    text-align: center;
}

.finish-auth-buttons {
    margin-top: auto;
    display: flex;
    justify-content: center;
    gap: 8px;
}

.finish-auth,
.cancel-auth {
    padding: 8px 12px;
}
</style>
