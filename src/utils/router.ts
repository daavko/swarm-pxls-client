import { computed, type ComputedRef } from 'vue';
import { useRoute } from 'vue-router';

export function useIntegerQueryParam(key: string): ComputedRef<number | null> {
    const route = useRoute();

    return computed(() => {
        const rawValue = route.query[key];
        if (Array.isArray(rawValue) || rawValue == null) {
            return null;
        }
        const value = Number.parseInt(rawValue, 10);
        return Number.isNaN(value) ? null : value;
    });
}
