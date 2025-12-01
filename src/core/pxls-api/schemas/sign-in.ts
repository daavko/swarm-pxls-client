import { UrlString } from '@/utils/schema.ts';
import * as v from 'valibot';

export const SignInResponse = v.object({
    url: UrlString,
});
export type SignInResponse = v.InferOutput<typeof SignInResponse>;
