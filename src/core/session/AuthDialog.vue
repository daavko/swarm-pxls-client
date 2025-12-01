<template>
    <h2>Log in / register</h2>
    <div class="auth-grid">
        <BlockButton
            class="auth-button"
            v-for="service in authServices"
            :key="service.id"
            :disabled="authInFlight"
            @click="authButtonClick(service.id)">
            {{ service.name }}
            <template v-if="!service.registrationEnabled">
                <br />
                <span class="registrations-disabled">Registrations disabled</span>
            </template>
        </BlockButton>
        <p v-if="showAuthError" class="auth-error">An error occurred</p>
    </div>
</template>

<script setup lang="ts">
import BlockButton from '@/core/common/BlockButton.vue';
import { useDialog } from '@/core/dialog/dialog.store.ts';
import { CURRENT_DIALOG } from '@/core/dialog/injection-symbols.ts';
import type { Dialog } from '@/core/dialog/types.ts';
import type { AuthService } from '@/core/pxls-api/schemas/info.ts';
import AuthFinishDialog from '@/core/session/AuthFinishDialog.vue';
import AuthInstructionsDialog from '@/core/session/AuthInstructionsDialog.vue';
import { useSession } from '@/core/session/session.store.ts';
import { promiseInFlightRef } from '@/utils/promise-ref.ts';
import { inject, onMounted, ref } from 'vue';

const { createDialog } = useDialog();
const { startAuthFlow } = useSession();
const { closeDialog } = useDialog();

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- safe
const dialog = inject(CURRENT_DIALOG) as Dialog;

const { updatePromise: updateAuthPromise, inFlight: authInFlight } = promiseInFlightRef();
const showAuthError = ref(false);

defineProps<{
    authServices: AuthService[];
}>();

onMounted(() => {
    createDialog({
        content: { component: AuthInstructionsDialog },
        closeOnEscape: false,
        closeOnBackdropClick: false,
        noCloseButton: false,
    });
});

function authButtonClick(providerId: string): void {
    showAuthError.value = false;
    updateAuthPromise(
        startAuthFlow(providerId)
            .then((success) => {
                if (success) {
                    createDialog({
                        content: { component: AuthFinishDialog },
                        closeOnEscape: false,
                        closeOnBackdropClick: false,
                        noCloseButton: true,
                    });
                    closeDialog(dialog.id);
                } else {
                    showAuthError.value = true;
                }
            })
            .catch(() => {
                showAuthError.value = true;
            }),
    );
}
</script>

<style scoped>
h2 {
    margin-bottom: 16px;
    text-align: center;
}

.auth-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
}

.auth-button {
    flex-direction: column;
    padding: 12px;

    .registrations-disabled {
        font-size: 0.875rem;
        color: #ff7f7f;
        font-style: italic;
    }
}

.auth-error {
    grid-column: 1 / -1;
    color: #ff7f7f;
    text-align: center;
}
</style>
