import type { RawChatMessage } from '@/core/pxls-api/schemas/chat-history.ts';

interface TextSegment {
    type: 'text';
    text: string;
}

interface MentionSegment {
    type: 'mention';
    userId: number;
    displayName: string;
}

interface EmoteSegment {
    type: 'emote';
    emoteId: number;
    emoteCode: string;
}

interface CoordinateLinkSegment {
    type: 'coordinateLink';
    x: number;
    y: number;
}

interface TemplateLinkSegment {
    type: 'templateLink';
    imageUrl: string;
    x: number;
    y: number;
    width: number;
}

export type ChatMessageSegment =
    | TextSegment
    | MentionSegment
    | EmoteSegment
    | CoordinateLinkSegment
    | TemplateLinkSegment;

export interface ChatMessage extends RawChatMessage {
    segments: ChatMessageSegment[];
}
