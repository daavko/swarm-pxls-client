import * as v from 'valibot';

export const IsoTimestampDate = v.pipe(
    v.string(),
    v.isoTimestamp(),
    v.transform((dateStr) => new Date(dateStr)),
);

export const MillisecondsDate = v.pipe(
    v.number(),
    v.transform((ms) => new Date(ms)),
);
export const SecondsDate = v.pipe(
    v.number(),
    v.transform((s) => new Date(s * 1000)),
);

export const Identifier = v.pipe(v.number(), v.safeInteger(), v.minValue(0));

export const Integer = v.pipe(v.number(), v.safeInteger());
export const NonNegativeInteger = v.pipe(v.number(), v.safeInteger(), v.minValue(0));
export const PositiveInteger = v.pipe(v.number(), v.safeInteger(), v.minValue(1));

export const NonNegativeNumber = v.pipe(v.number(), v.minValue(0));

export const UrlString = v.pipe(v.string(), v.nonEmpty(), v.url());
