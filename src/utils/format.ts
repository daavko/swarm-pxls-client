import { Duration } from 'luxon';
import { computed, type ComputedRef, type MaybeRefOrGetter, toRef } from 'vue';

const numberFormatter = new Intl.NumberFormat(undefined, {});

export function useFormatNumber(value: MaybeRefOrGetter<number | null | undefined>): ComputedRef<string> {
    const valueRef = toRef(value);
    return computed(() => {
        if (valueRef.value == null) {
            return '';
        }
        return numberFormatter.format(valueRef.value);
    });
}

export function useCooldownFormat(
    milliseconds: MaybeRefOrGetter<number | null | undefined>,
    showMilliseconds: MaybeRefOrGetter<boolean>,
): ComputedRef<string> {
    const msRef = toRef(milliseconds);
    const showMsRef = toRef(showMilliseconds);

    return computed(() => {
        if (msRef.value == null) {
            return '';
        }

        let duration = Duration.fromMillis(msRef.value).shiftTo('minutes', 'seconds');
        if (!showMsRef.value) {
            duration = duration.set({ seconds: Math.ceil(duration.seconds) });
        }
        return duration.toFormat(showMsRef.value ? 'mm:ss.SSS' : 'mm:ss');
    });
}
