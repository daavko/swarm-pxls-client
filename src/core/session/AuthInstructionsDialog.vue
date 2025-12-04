<template>
    <div class="container">
        <h2>Login / registration instructions</h2>
        <h3>WARNING: THIS IS AN EXPERIMENTAL CLIENT IN DEVELOPMENT.</h3>
        <h3>DISCLAIMER: THE AUTHOR OF THIS CLIENT IS NOT RESPONSIBLE FOR ANY BANS ARISING FROM ITS USE.</h3>
        <p>
            Logging in on this client is a bit different from normal Pxls.
            <strong>Pay attention to the instructions</strong>.
        </p>
        <p>
            After you've logged in with Discord/Google/Reddit/whatever, you will be brought to a page with a "Finish
            Login" link. <strong>Do not click this link</strong>. Only copy it, return to this page, and paste it into a
            provided text field.
        </p>
        <BlockButton class="ok-button" :disabled="understandButtonDisabled" @click="closeDialog(dialog.id)">
            I understand {{ countdown }}
        </BlockButton>
    </div>
</template>

<script setup lang="ts">
import BlockButton from '@/core/common/BlockButton.vue';
import { useDialog } from '@/core/dialog/dialog.store.ts';
import { CURRENT_DIALOG } from '@/core/dialog/injection-symbols.ts';
import type { Dialog } from '@/core/dialog/types.ts';
import { useNow } from '@vueuse/core';
import { computed, inject, onMounted, ref } from 'vue';

const { closeDialog } = useDialog();

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- safe
const dialog = inject(CURRENT_DIALOG) as Dialog;

const COUNTDOWN_DURATION_MS = 10000;
const countdownStartTime = ref(Date.now());
const now = useNow();
const understandButtonDisabled = computed(() => {
    return now.value.getTime() - countdownStartTime.value < COUNTDOWN_DURATION_MS;
});
const countdown = computed(() => {
    const secondsLeft = Math.ceil((COUNTDOWN_DURATION_MS - (now.value.getTime() - countdownStartTime.value)) / 1000);
    return secondsLeft > 0 ? ` (${secondsLeft})` : '';
});

onMounted(() => {
    countdownStartTime.value = Date.now();
});
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    flex: 1;
}

h2 {
    text-align: center;
    margin-bottom: 16px;
}

h3 {
    margin-bottom: 16px;
}

p {
    margin-bottom: 16px;
}

.ok-button {
    margin-top: auto;
    padding: 8px 24px;
    align-self: center;
}
</style>
