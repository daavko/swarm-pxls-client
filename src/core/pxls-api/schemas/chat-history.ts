import { Identifier, NonNegativeInteger, SecondsDate } from '@/utils/schema.ts';
import * as v from 'valibot';

export const ChatBadge = v.object({
    displayName: v.string(),
    tooltip: v.string(),
    type: v.string(),
});
export type ChatBadge = v.InferOutput<typeof ChatBadge>;

const ChatMessagePurge = v.object({
    initiator: v.string(),
    reason: v.string(),
});
export type ChatMessagePurge = v.InferOutput<typeof ChatMessagePurge>;

const StrippedFaction = v.object({
    id: Identifier,
    name: v.string(),
    tag: v.string(),
    color: NonNegativeInteger,
});
export type StrippedFaction = v.InferOutput<typeof StrippedFaction>;

const RawChatMessage = v.object({
    id: Identifier,
    author: v.string(),
    date: SecondsDate,
    message_raw: v.string(),
    replyingToId: Identifier,
    replyShouldMention: v.optional(v.boolean()),
    purge: v.optional(ChatMessagePurge),
    badges: v.array(ChatBadge),
    authorNameClass: v.optional(v.string()),
    authorNameColor: NonNegativeInteger,
    authorWasShadowBanned: v.optional(v.boolean()),
    strippedFaction: v.optional(StrippedFaction),
});
export type RawChatMessage = v.InferOutput<typeof RawChatMessage>;

export const ChatHistoryResponse = v.array(RawChatMessage);
