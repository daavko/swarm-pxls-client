import * as v from 'valibot';
import { UrlString } from '@/utils/schema.ts';

export const SignInResponse = v.object({
    url: UrlString,
});
export type SignInResponse = v.InferOutput<typeof SignInResponse>;
