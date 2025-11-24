import * as v from 'valibot';

export const AuthResponse = v.object({
    token: v.string(),
    signup: v.boolean(),
});
export type AuthResponse = v.InferOutput<typeof AuthResponse>;
