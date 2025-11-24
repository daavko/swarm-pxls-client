<template>
    <div class="bubble">
        <template v-if="expanded">
            <button class="bubble-collapse-button" @click="toggleExpanded">
                <MdiIcon :iconPath="mdiChevronDown"></MdiIcon>
            </button>
            <div class="bubble-rows">
                <div class="bubble-section__row">
                    <MdiIcon :iconPath="mdiAccount" :size="20"></MdiIcon>
                    <p class="text-underline">
                        <router-link to="/user/username" class="cursor-pointer">username</router-link>
                    </p>
                </div>
                <div class="bubble-section__row">
                    <MdiIcon :iconPath="mdiChartLine" :size="20"></MdiIcon>
                    <p><span class="fw-bold">Canvas:</span> 1234</p>
                </div>
                <div class="bubble-section__row">
                    <MdiIcon :iconPath="mdiChartAreasplineVariant" :size="20"></MdiIcon>
                    <p><span class="fw-bold">All Time:</span> 123456</p>
                </div>
                <div class="bubble-section__row bubble-section__row--large-gap">
                    <MdiIcon :iconPath="mdiAccountGroup" :size="20"></MdiIcon>
                    <p><span class="fw-bold">Online:</span> 100</p>
                </div>

                <div class="bubble-section__row">
                    <MdiIcon :iconPath="mdiCompass" :size="20"></MdiIcon>
                    <p class="text-underline"><a @click.prevent="">(1234, 123)</a></p>
                </div>
                <div class="bubble-section__row">
                    <MdiIcon :iconPath="mdiCube" :size="20"></MdiIcon>
                    <p><span class="fw-bold">Pixels:</span> 6/6</p>
                </div>
                <div class="bubble-section__row">
                    <MdiIcon :iconPath="mdiClock" :size="20"></MdiIcon>
                    <p><span class="fw-bold">00:00</span></p>
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
                        <p><span class="fw-bold">00:00</span></p>
                    </div>
                </div>
                <button class="bubble-expand-button flex-center" @click="toggleExpanded">
                    <MdiIcon :iconPath="mdiChevronUp" :size="32"></MdiIcon>
                </button>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import MdiIcon from '@/core/common/MdiIcon.vue';
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
import { ref } from 'vue';

const expanded = ref(false);

function toggleExpanded(): void {
    expanded.value = !expanded.value;
}
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
    background: none;
    color: white;
    margin-bottom: 4px;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
    }
}

.collapsed-info {
    display: flex;
    font-size: 1.25rem;
    align-items: stretch;
}

.bubble-expand-button {
    width: 48px;
    color: white;
    margin-left: 8px;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
    }
}
</style>
