import type { MaybeElementRef } from '@vueuse/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'vertical' | 'horizontal';

export interface TooltipProps {
    position?: TooltipPosition;
    target: MaybeElementRef;
    offset?: number;
    showDelay?: number;
    hideDelay?: number;
}
