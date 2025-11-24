import { Identifier, Integer, MillisecondsDate, NonNegativeInteger } from '@/utils/schema.ts';
import * as v from 'valibot';

const PixelLookup = v.object({
    id: Identifier,
    x: Integer,
    y: Integer,
    pixelCount: v.optional(NonNegativeInteger),
    pixelCountAlltime: v.optional(NonNegativeInteger),
    time: MillisecondsDate,
    username: v.optional(v.string()),
    discordName: v.optional(v.string()),
    faction: v.string(),
});
export type PixelLookup = v.InferOutput<typeof PixelLookup>;
