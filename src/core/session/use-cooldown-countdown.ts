import { useSession } from '@/core/session/session.store.ts';
import { useCooldownFormat } from '@/utils/format.ts';
import { storeToRefs } from 'pinia';
import { computed, type ComputedRef, type MaybeRefOrGetter } from 'vue';

export function useCooldownCountdown(showMilliseconds: MaybeRefOrGetter<boolean>): ComputedRef<string> {
    const { cooldown } = storeToRefs(useSession());

    const cooldownMilliseconds = computed(() => {
        return cooldown.value?.millisecondsLeft;
    });
    return useCooldownFormat(cooldownMilliseconds, showMilliseconds);
}
