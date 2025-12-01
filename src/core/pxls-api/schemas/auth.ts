import { UrlString } from '@/utils/schema.ts';
import * as v from 'valibot';

export const StartAuthResponse = v.object({
    url: UrlString,
});
export type StartAuthResponse = v.InferOutput<typeof StartAuthResponse>;

export const AuthResponse = v.object({
    token: v.string(),
    signup: v.boolean(),
});
export type AuthResponse = v.InferOutput<typeof AuthResponse>;
