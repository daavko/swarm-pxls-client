import { ChatBadge } from '@/core/pxls-api/schemas/chat-history.ts';
import { Notification } from '@/core/pxls-api/schemas/notifications.ts';
import { Integer, MillisecondsDate, NonNegativeInteger, NonNegativeNumber, SecondsDate } from '@/utils/schema.ts';
import * as v from 'valibot';

const PixelMessage = v.object({
    type: v.literal('pixel'),
    pixels: v.array(
        v.object({
            x: Integer,
            y: Integer,
            color: NonNegativeInteger,
        }),
    ),
});
export type PixelMessage = v.InferOutput<typeof PixelMessage>;

const AckMessage = v.object({
    type: v.literal('ACK'),
    ackFor: v.picklist(['PLACE', 'UNDO']),
    x: Integer,
    y: Integer,
});
export type AckMessage = v.InferOutput<typeof AckMessage>;

const PixelCountsMessage = v.object({
    type: v.literal('pixelCounts'),
    pixelCount: NonNegativeInteger,
    pixelCountAllTime: NonNegativeInteger,
});
export type PixelCountsMessage = v.InferOutput<typeof PixelCountsMessage>;

const ChatBanStateMessage = v.object({
    type: v.literal('chat_ban_state'),
    permanent: v.boolean(),
    expiry: MillisecondsDate,
});
export type ChatBanStateMessage = v.InferOutput<typeof ChatBanStateMessage>;

const ChatMessageMessage = v.object({
    type: v.literal('chat_message'),
    message: v.object({
        id: NonNegativeInteger,
        author: v.string(),
        date: SecondsDate,
        message_raw: v.string(),
        replyingToId: v.optional(NonNegativeInteger),
        replyShouldMention: v.optional(v.boolean()),
        badges: v.array(ChatBadge),
        authorNameClass: v.optional(v.array(v.string())),
        authorNameColor: Integer,
    }),
});
export type ChatMessageMessage = v.InferOutput<typeof ChatMessageMessage>;

const PingMessage = v.object({
    type: v.literal('ping'),
});
export type PingMessage = v.InferOutput<typeof PingMessage>;

const UserCountMessage = v.object({
    type: v.literal('users'),
    count: NonNegativeInteger,
});
export type UserCountMessage = v.InferOutput<typeof UserCountMessage>;

const AlertMessage = v.object({
    type: v.literal('alert'),
    sender: v.string(),
    message: v.string(),
});
export type AlertMessage = v.InferOutput<typeof AlertMessage>;

const CanUndoMessage = v.object({
    type: v.literal('can_undo'),
    time: NonNegativeNumber,
});
export type CanUndoMessage = v.InferOutput<typeof CanUndoMessage>;

const CooldownMessage = v.object({
    type: v.literal('cooldown'),
    wait: NonNegativeNumber,
});
export type CooldownMessage = v.InferOutput<typeof CooldownMessage>;

const NotificationMessage = v.object({
    type: v.literal('notification'),
    notification: Notification,
});
export type NotificationMessage = v.InferOutput<typeof NotificationMessage>;

const PixelsMessage = v.object({
    type: v.literal('pixels'),
    count: NonNegativeInteger,
    cause: v.picklist(['auth', 'connect', 'consume', 'override', 'stackGain', 'undo']),
});
export type PixelsMessage = v.InferOutput<typeof PixelsMessage>;

const Role = v.object({
    id: v.string(),
    name: v.string(),
    guest: v.boolean(),
    defaultRole: v.boolean(),
    inherits: v.array(v.string()),
    badges: v.array(ChatBadge),
    permissions: v.array(v.string()),
});
export type Role = v.InferOutput<typeof Role>;

const UserinfoMessage = v.object({
    type: v.literal('userinfo'),
    username: v.string(),
    roles: v.array(Role),
    pixelCount: NonNegativeInteger,
    pixelCountAllTime: NonNegativeInteger,
    banned: v.boolean(),
    banReason: v.string(),
    method: v.string(),
    placementOverrides: v.object({
        ignoreCooldown: v.boolean(),
        canPlaceAnyColor: v.boolean(),
        ignorePlacemap: v.boolean(),
    }),
    chatBanned: v.boolean(),
    chatbanIsPerma: v.boolean(),
    chatbanExpiry: MillisecondsDate,
    renameRequested: v.boolean(),
    discordName: v.optional(v.string()),
    chatNameColor: NonNegativeInteger,
});
export type UserinfoMessage = v.InferOutput<typeof UserinfoMessage>;

export const SocketClientMessage = v.variant('type', [
    PixelMessage,
    AckMessage,
    PixelCountsMessage,
    ChatBanStateMessage,
    ChatMessageMessage,
    PingMessage,
    UserCountMessage,
    AlertMessage,
    CanUndoMessage,
    CooldownMessage,
    NotificationMessage,
    PixelsMessage,
    UserinfoMessage,
]);
export type SocketClientMessage = v.InferOutput<typeof SocketClientMessage>;
