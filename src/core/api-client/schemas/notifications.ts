import * as v from 'valibot';

export const Notification = v.object({
    id: v.number(),
    time: v.number(),
    expiry: v.optional(v.number()),
    who: v.string(),
    title: v.string(),
    content: v.string(),
});
export type Notification = v.InferOutput<typeof Notification>;
