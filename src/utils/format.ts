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
