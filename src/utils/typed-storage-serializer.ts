import type { Serializer } from '@vueuse/core';
import type { GenericSchema } from 'valibot';
import * as v from 'valibot';

export const typedStorageSerializer = <TInput, TOutput>(
    schema: GenericSchema<TInput, TOutput>,
): Serializer<TOutput> => {
    return {
        read: (raw: string): TOutput => {
            const rawObject = JSON.parse(raw);
            return v.parse(schema, rawObject);
        },
        write: (value: TOutput): string => {
            return JSON.stringify(value);
        },
    };
};
