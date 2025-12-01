<template>
    <div class="bubble">
        <template v-if="showAsExpanded">
            <MdiIconButton class="bubble-collapse-button" :iconPath="mdiChevronDown"></MdiIconButton>
            <div class="bubble-rows" :class="{ 'bubble-rows--no-collapse': !loggedIn }">
                <template v-if="userInfo">
                    <div class="bubble-section__row">
                        <MdiIcon :iconPath="mdiAccount" :size="20"></MdiIcon>
                        <p class="text-underline">
                            <router-link :to="'/user/' + userInfo.username" class="cursor-pointer">{{
                                userInfo.username
                            }}</router-link>
                        </p>
                    </div>
                    <div class="bubble-section__row">
                        <MdiIcon :iconPath="mdiChartLine" :size="20"></MdiIcon>
                        <p><span class="fw-bold">Canvas:</span> {{ formattedPixelCount }}</p>
                    </div>
                    <div class="bubble-section__row">
                        <MdiIcon :iconPath="mdiChartAreasplineVariant" :size="20"></MdiIcon>
                        <p><span class="fw-bold">All Time:</span> {{ formattedPixelCountAllTime }}</p>
                    </div>
                </template>

                <div class="bubble-section__row bubble-section__row--large-gap">
                    <MdiIcon :iconPath="mdiAccountGroup" :size="20"></MdiIcon>
                    <p>
                        <span class="fw-bold">Online: </span>
                        <template v-if="usersLoadState === 'loading'">Loading user count...</template>
                        <template v-if="usersLoadState === 'success' && userCount !== null">{{ userCount }}</template>
                    </p>
                </div>

                <!-- TODO: cursor location -->
                <div class="bubble-section__row">
                    <MdiIcon :iconPath="mdiCompass" :size="20"></MdiIcon>
                    <p class="text-underline"><a @click.prevent="">(TODO, TODO)</a></p>
                </div>

                <div v-if="showAvailablePixels" class="bubble-section__row">
                    <MdiIcon :iconPath="mdiCube" :size="20"></MdiIcon>
                    <p><span class="fw-bold">Pixels:</span> {{ availablePixels }}/{{ info?.maxStacked }}</p>
                </div>

                <div v-if="loggedIn && cooldown != null" class="bubble-section__row">
                    <MdiIcon :iconPath="mdiClock" :size="20"></MdiIcon>
                    <p>
                        <span class="fw-bold">{{ formattedCooldown }}</span>
                    </p>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="collapsed-info">
                <div class="bubble-rows-collapsed">
                    <div class="bubble-section__row">
                        <MdiIcon :iconPath="mdiCube" :size="24"></MdiIcon>
                        <p class="fw-bold">6/6</p>
                    </div>
                    <div class="bubble-section__row">
                        <MdiIcon :iconPath="mdiClock" :size="24"></MdiIcon>
                        <p><span class="fw-bold"></span></p>
                    </div>
                </div>
                <MdiIconButton
                    class="bubble-expand"
                    :iconPath="mdiChevronUp"
                    :size="32"
                    @click="toggleExpanded"></MdiIconButton>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { useUsersStore } from '@/core/canvas/users.store.ts';
import MdiIcon from '@/core/common/MdiIcon.vue';
import MdiIconButton from '@/core/common/MdiIconButton.vue';
import {
    mdiAccount,
    mdiAccountGroup,
    mdiChartAreasplineVariant,
    mdiChartLine,
    mdiChevronDown,
    mdiChevronUp,
    mdiClock,
    mdiCompass,
    mdiCube,
} from '@mdi/js';
import { computed, onBeforeMount, ref } from 'vue';
import { useTypeAssistedCanvasInfo } from '@/core/canvas/canvas.store.ts';
import { useSession, useTypeAssistedSessionUserInfo } from '@/core/session/session.store.ts';
import { useFormatNumber } from '@/utils/format.ts';
import { storeToRefs } from 'pinia';
import { useCooldownCountdown } from '@/core/session/use-cooldown-countdown.ts';

const { usersLoadState, userCount } = storeToRefs(useUsersStore());
const { loadUserCount } = useUsersStore();
const { loggedIn, availablePixels, cooldown } = storeToRefs(useSession());
const userInfo = useTypeAssistedSessionUserInfo();
const info = useTypeAssistedCanvasInfo();

const expanded = ref(true);

const showAsExpanded = computed(() => !loggedIn.value || expanded.value);
const showAvailablePixels = computed(() => {
    return info.value !== null && availablePixels.value !== null && loggedIn.value;
});
const pixelCount = computed(() => userInfo.value?.pixelCount);
const pixelCountAllTime = computed(() => userInfo.value?.pixelCountAllTime);
const formattedPixelCount = useFormatNumber(pixelCount);
const formattedPixelCountAllTime = useFormatNumber(pixelCountAllTime);
const formattedCooldown = useCooldownCountdown(true);

function toggleExpanded(): void {
    expanded.value = !expanded.value;
}

onBeforeMount(() => {
    void loadUserCount();
});
</script>

<style scoped>
.bubble {
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 8px;
    overflow: hidden;
    min-width: 150px;
}

.bubble-rows {
    padding-inline: 12px;
    padding-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.bubble-rows--no-collapse {
    padding-top: 12px;
}

.bubble-rows-collapsed {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-block: 12px;
    padding-left: 12px;
}

.bubble-section__row {
    display: flex;
    align-items: center;
    gap: 4px;

    &.bubble-section__row--large-gap {
        margin-bottom: 8px;
    }
}

.bubble-collapse-button {
    width: 100%;
    color: white;
    margin-bottom: 4px;
    padding-block: 4px;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
    }
}

.collapsed-info {
    display: flex;
    font-size: 1.25rem;
    align-items: stretch;
}

.bubble-expand {
    width: 48px;
    color: white;
    margin-left: 8px;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
    }
}
</style>
