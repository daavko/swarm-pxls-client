import { PositiveInteger } from '@/utils/schema.ts';
import * as v from 'valibot';

const RawPaletteItem = v.object({
    name: v.string(),
    value: v.pipe(v.string(), v.regex(/^[0-9a-f]{6}$/i)),
});
export type RawPaletteItem = v.InferOutput<typeof RawPaletteItem>;

export interface PaletteItem {
    index: number;
    name: string;
    hex: string;
    rawRgba: number;
}

const CooldownInfo = v.object({
    type: v.string(),
    staticCooldownSeconds: PositiveInteger,
    activityCooldown: v.object({
        steepness: v.number(),
        multiplier: v.number(),
        globalOffset: v.number(),
        userOffset: v.number(),
    }),
});
export type CooldownInfo = v.InferOutput<typeof CooldownInfo>;

const AuthService = v.object({
    id: v.string(),
    name: v.string(),
    registrationEnabled: v.boolean(),
});
export type AuthService = v.InferOutput<typeof AuthService>;

const CustomEmoji = v.object({
    emoji: v.string(),
    name: v.string(),
});
export type CustomEmoji = v.InferOutput<typeof CustomEmoji>;

export const InfoResponse = v.object({
    canvasCode: v.string(),
    width: PositiveInteger,
    height: PositiveInteger,
    palette: v.pipe(
        v.array(RawPaletteItem),
        v.transform((items): PaletteItem[] => {
            return items.map((item, index) => {
                const r = parseInt(item.value.slice(0, 2), 16);
                const g = parseInt(item.value.slice(2, 4), 16);
                const b = parseInt(item.value.slice(4, 6), 16);
                const a = 255;
                const rawRgba = (a << 24) | (b << 16) | (g << 8) | r;
                return {
                    index,
                    name: item.name,
                    hex: `#${item.value.toLowerCase()}`,
                    rawRgba,
                };
            });
        }),
    ),
    cooldownInfo: CooldownInfo,
    captchaKey: v.string(),
    heatmapCooldown: PositiveInteger,
    maxStacked: PositiveInteger,
    authServices: v.array(AuthService),
    registrationEnabled: v.boolean(),
    chatEnabled: v.boolean(),
    chatRespectsCanvasBan: v.boolean(),
    chatCharacterLimit: PositiveInteger,
    chatBannerText: v.array(v.string()),
    snipMode: v.boolean(),
    emoteSet7TV: v.string(),
    customEmoji: v.array(CustomEmoji),
    legal: v.object({
        termsUrl: v.string(),
        privacyUrl: v.string(),
    }),
    chatRatelimitMessage: v.string(),
    chatLinkMinimumPixelCount: PositiveInteger,
    chatLinkSendToStaff: v.boolean(),
    chatDefaultExternalLinkPopup: v.boolean(),
});
export type InfoResponse = v.InferOutput<typeof InfoResponse>;
