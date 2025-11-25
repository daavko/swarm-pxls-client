import * as v from 'valibot';
import { UrlString } from '@/utils/schema.ts';

export const LoginResponse = v.object({
    url: UrlString,
});
export type LoginResponse = v.InferOutput<typeof LoginResponse>;

export const AuthResponse = v.object({
    token: v.string(),
    signup: v.boolean(),
});
export type AuthResponse = v.InferOutput<typeof AuthResponse>;
