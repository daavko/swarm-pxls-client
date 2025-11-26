import { computed, type ComputedRef, ref } from 'vue';

interface PromiseInFlightRefReturn {
    inFlight: ComputedRef<boolean>;
    updatePromise: (promise: Promise<unknown>) => void;
}

export function promiseInFlightRef(initialPromise?: Promise<unknown>): PromiseInFlightRefReturn {
    const inFlight = ref(false);

    function updatePromise(promise: Promise<unknown>): void {
        inFlight.value = true;
        void promise.finally(() => {
            inFlight.value = false;
        });
    }

    if (initialPromise) {
        updatePromise(initialPromise);
    }

    return {
        inFlight: computed(() => inFlight.value),
        updatePromise,
    };
}
