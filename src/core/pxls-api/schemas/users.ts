import { NonNegativeInteger } from '@/utils/schema.ts';
import * as v from 'valibot';

export const UsersResponse = v.object({
    type: v.literal('users'),
    count: NonNegativeInteger,
});
export type UsersResponse = v.InferOutput<typeof UsersResponse>;
