<template>
    <Teleport to="body">
        <div
            class="tooltip-container"
            :class="{
                'tooltip-container--hidden': hidden,
                'tooltip-container--vertically-centered':
                    position === 'horizontal' || position === 'left' || position === 'right',
                'tooltip-container--horizontally-centered':
                    position === 'vertical' || position === 'top' || position === 'bottom',
            }"
            :style="{ '--tooltip-top': stylePosition?.y ?? '0', '--tooltip-left': stylePosition?.x ?? '0' }"
            ref="tooltip">
            <slot></slot>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import type { TooltipProps } from '@/core/tooltip/types.ts';
import type { Point } from '@/utils/geometry.ts';
import { unrefElement, useElementBounding, useElementSize, useEventListener, useWindowSize } from '@vueuse/core';
import { computed, ref, useTemplateRef } from 'vue';

const { position = 'vertical', offset = 8, showDelay = 150, hideDelay = 50, target } = defineProps<TooltipProps>();
const tooltipRef = useTemplateRef<HTMLElement>('tooltip');
const targetElement = computed(() => unrefElement(target));

const { top, left, right, bottom, width: targetWidth, height: targetHeight } = useElementBounding(targetElement);
const { width: selfWidth, height: selfHeight } = useElementSize(tooltipRef, undefined, { box: 'border-box' });
const { width: windowWidth, height: windowHeight } = useWindowSize({ type: 'visual' });

const mouseIsInside = ref(false);
const stylePosition = computed((): Point | null => {
    const targetValue = targetElement.value;
    if (targetValue == null || targetWidth.value === 0 || targetHeight.value === 0) {
        return null;
    }

    const selfWidthValue = selfWidth.value;
    const selfHeightValue = selfHeight.value;
    if (selfWidthValue === 0 || selfHeightValue === 0) {
        return null;
    }

    let x: number;
    let y: number;
    function before(boundary: number, size: number): number {
        return boundary - offset - size;
    }
    function after(boundary: number): number {
        return boundary + offset;
    }
    function center(start: number, size: number, selfSize: number): number {
        return start + size / 2 - selfSize / 2;
    }
    if (position === 'top' || position === 'bottom' || position === 'vertical') {
        x = center(left.value, targetWidth.value, selfWidthValue);
        if (position === 'top' || (position === 'vertical' && top.value >= selfHeightValue + offset)) {
            y = before(top.value, selfHeightValue);
        } else {
            y = after(bottom.value);
        }
    } else {
        y = center(top.value, targetHeight.value, selfHeightValue);
        if (position === 'left' || (position === 'horizontal' && left.value >= selfWidthValue + offset)) {
            x = before(left.value, selfWidthValue);
        } else {
            x = after(right.value);
        }
    }

    // adjust to fit in window
    if (x + selfWidthValue + offset > windowWidth.value) {
        x = windowWidth.value - selfWidthValue - offset;
    } else if (x < offset) {
        x = offset;
    }

    if (y + selfHeightValue + offset > windowHeight.value) {
        y = windowHeight.value - selfHeightValue - offset;
    } else if (y < offset) {
        y = offset;
    }

    return { x, y };
});
const hidden = computed(() => {
    return !mouseIsInside.value || !targetElement.value || !stylePosition.value;
});

let showTimeout: ReturnType<typeof setTimeout> | null = null;
let hideTimeout: ReturnType<typeof setTimeout> | null = null;
useEventListener(targetElement, 'pointerenter', () => {
    if (hideTimeout != null) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
    }
    showTimeout = setTimeout(() => {
        mouseIsInside.value = true;
    }, showDelay);
});
useEventListener(targetElement, 'pointerleave', () => {
    if (showTimeout != null) {
        clearTimeout(showTimeout);
        showTimeout = null;
    }
    hideTimeout = setTimeout(() => {
        mouseIsInside.value = false;
    }, hideDelay);
});
</script>

<style scoped>
.tooltip-container {
    position: fixed;
    z-index: var(--tooltip-z-index);
    pointer-events: none;
    opacity: 1;
    transition: opacity 0.1s ease-in-out;
    top: calc(var(--tooltip-top) * 1px);
    left: calc(var(--tooltip-left) * 1px);
    background: var(--tooltip-bg-color);
    color: var(--tooltip-text-color);
    border-radius: 4px;
    padding: 4px 8px;
}

.tooltip-container--hidden {
    opacity: 0;
}

/*.tooltip-container--vertically-centered {
    transform: translateY(-50%);
}

.tooltip-container--horizontally-centered {
    transform: translateX(-50%);
}*/
</style>
