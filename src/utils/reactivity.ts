import { customRef, getCurrentScope, type MaybeRefOrGetter, type Ref, toRef, toValue, watch } from 'vue';

export function useNumericRefWithBounds(
    initialValue: number | null,
    min?: MaybeRefOrGetter<number | null | undefined>,
    max?: MaybeRefOrGetter<number | null | undefined>,
): Ref<number | null> {
    return customRef<number | null>((track, trigger) => {
        let internalValue = initialValue;

        const minRef = toRef(min);
        const maxRef = toRef(max);

        getCurrentScope()?.run(() => {
            watch(minRef, (newMin) => {
                if (internalValue != null && newMin != null && internalValue < newMin) {
                    internalValue = newMin;
                    trigger();
                }
            });
            watch(maxRef, (newMax) => {
                if (internalValue != null && newMax != null && internalValue > newMax) {
                    internalValue = newMax;
                    trigger();
                }
            });
        });

        return {
            get() {
                track();
                return internalValue;
            },
            set(newValue: number | null) {
                if (newValue == null) {
                    if (internalValue !== null) {
                        internalValue = null;
                        trigger();
                    }
                    return;
                }

                const minValue = toValue(min);
                const maxValue = toValue(max);
                if (minValue != null && newValue < minValue) {
                    newValue = minValue;
                }
                if (maxValue != null && newValue > maxValue) {
                    newValue = maxValue;
                }
                if (internalValue !== newValue) {
                    internalValue = newValue;
                    trigger();
                }
            },
        };
    });
}
