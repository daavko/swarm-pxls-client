const epsilon = 0.008856451679035631;
const kappa = 903.2962962962963;

function rgbToLab(sr: number, sg: number, sb: number, LABOutput: [number, number, number]): void {
    // color space conversion code adapted from color.js, just moved all in a single function
    // color.js is licensed under MIT License, as per https://github.com/color-js/color.js/blob/main/LICENSE

    // convert sRGBA [0,255] to sRGB [0,1]
    const r = sr / 255;
    const g = sg / 255;
    const b = sb / 255;

    // convert sRGB [0,1] to linear RGB [0,1]
    const lr = r <= 0.04045 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4;
    const lg = g <= 0.04045 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4;
    const lb = b <= 0.04045 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4;

    // convert linear RGB [0,1] to XYZ D65 [0,1]
    const x = lr * 0.41239079926595934 + lg * 0.357584339383878 + lb * 0.1804807884018343;
    const y = lr * 0.21263900587151027 + lg * 0.715168678767756 + lb * 0.07219231536073371;
    const z = lr * 0.01933081871559182 + lg * 0.11919477979462598 + lb * 0.9505321522496607;

    // convert XYZ D65 [0,1] to CIE-L*a*b*
    const xn = x / 0.9504559270516716;
    const yn = y;
    const zn = z / 1.0890577507598784;

    const fx = xn > epsilon ? Math.cbrt(xn) : (kappa * xn + 16) / 116;
    const fy = yn > epsilon ? Math.cbrt(yn) : (kappa * yn + 16) / 116;
    const fz = zn > epsilon ? Math.cbrt(zn) : (kappa * zn + 16) / 116;

    const L = 116 * fy - 16;
    const aStar = 500 * (fx - fy);
    const bStar = 200 * (fy - fz);

    LABOutput[0] = L;
    LABOutput[1] = aStar;
    LABOutput[2] = bStar;
}

export function rawSrgbaToLab(rawSrgba: number): [number, number, number] {
    const r = (rawSrgba >> 24) & 0xff;
    const g = (rawSrgba >> 16) & 0xff;
    const b = (rawSrgba >> 8) & 0xff;

    const ret: [number, number, number] = [0, 0, 0];
    rgbToLab(r, g, b, ret);
    return ret;
}

export function srgbaToLab(pixels: Uint8ClampedArray, LOutput: number[], aOutput: number[], bOutput: number[]): void {
    if (LOutput.length !== pixels.length / 4) {
        throw new Error('L* array has incorrect size.');
    }
    if (aOutput.length !== pixels.length / 4) {
        throw new Error('a* array has incorrect size.');
    }
    if (bOutput.length !== pixels.length / 4) {
        throw new Error('b* array has incorrect size.');
    }

    const scratch: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < pixels.length / 4; i++) {
        rgbToLab(pixels[i * 4]!, pixels[i * 4 + 1]!, pixels[i * 4 + 2]!, scratch);

        LOutput[i] = scratch[0]!;
        aOutput[i] = scratch[1]!;
        bOutput[i] = scratch[2]!;
    }
}

const Gfactor = 25 ** 7;
const r2d = 180 / Math.PI;
const d2r = Math.PI / 180;

export function ciede2000(
    L1: number,
    a1: number,
    b1: number,
    L2: number,
    a2: number,
    b2: number,
    kL = 1,
    kC = 1,
    kH = 1,
): number {
    // Implementation of the CIEDE2000 color difference formula, adapted from color.js
    // color.js is licensed under MIT License, as per https://github.com/color-js/color.js/blob/main/LICENSE

    const C1 = Math.sqrt(a1 ** 2 + b1 ** 2);
    const C2 = Math.sqrt(a2 ** 2 + b2 ** 2);

    const CBar = (C1 + C2) / 2;

    const C7 = CBar ** 7;

    const G = 0.5 * (1 - Math.sqrt(C7 / (C7 + Gfactor)));

    const adash1 = (1 + G) * a1;
    const adash2 = (1 + G) * a2;

    const Cdash1 = Math.sqrt(adash1 ** 2 + b1 ** 2);
    const Cdash2 = Math.sqrt(adash2 ** 2 + b2 ** 2);

    let h1 = adash1 === 0 && b1 === 0 ? 0 : Math.atan2(b1, adash1);
    let h2 = adash2 === 0 && b2 === 0 ? 0 : Math.atan2(b2, adash2);

    if (h1 < 0) {
        h1 += 2 * Math.PI;
    }
    if (h2 < 0) {
        h2 += 2 * Math.PI;
    }

    h1 *= r2d;
    h2 *= r2d;

    const dL = L2 - L1;
    const dC = Cdash2 - Cdash1;

    const hdiff = h2 - h1;
    const hsum = h1 + h2;
    const habs = Math.abs(hdiff);
    let dh;

    if (Cdash1 * Cdash2 === 0) {
        dh = 0;
    } else if (habs <= 180) {
        dh = hdiff;
    } else if (hdiff > 180) {
        dh = hdiff - 360;
    } else if (hdiff < -180) {
        dh = hdiff + 360;
    } else {
        throw new Error('Unreachable code reached in CIEDE2000 calculation.');
    }

    const dH = 2 * Math.sqrt(Cdash2 * Cdash1) * Math.sin((dh * d2r) / 2);

    const Ldash = (L1 + L2) / 2;
    const Cdash = (Cdash1 + Cdash2) / 2;
    const Cdash7 = Cdash ** 7;

    let hdash;
    if (Cdash1 * Cdash2 === 0) {
        hdash = hsum;
    } else if (habs <= 180) {
        hdash = hsum / 2;
    } else if (hsum < 360) {
        hdash = (hsum + 360) / 2;
    } else {
        hdash = (hsum - 360) / 2;
    }

    const lsq = (Ldash - 50) ** 2;
    const SL = 1 + (0.015 * lsq) / Math.sqrt(20 + lsq);

    const SC = 1 + 0.045 * Cdash;

    let T = 1;
    T -= 0.17 * Math.cos((hdash - 30) * d2r);
    T += 0.24 * Math.cos(2 * hdash * d2r);
    T += 0.32 * Math.cos((3 * hdash + 6) * d2r);
    T -= 0.2 * Math.cos((4 * hdash - 63) * d2r);

    const SH = 1 + 0.015 * Cdash * T;

    const dTheta = 30 * Math.exp(-1 * ((hdash - 275) / 25) ** 2);
    const RC = 2 * Math.sqrt(Cdash7 / (Cdash7 + Gfactor));
    const RT = -1 * Math.sin(2 * dTheta * d2r) * RC;

    let dE = (dL / (kL * SL)) ** 2;
    dE += (dC / (kC * SC)) ** 2;
    dE += (dH / (kH * SH)) ** 2;
    dE += RT * (dC / (kC * SC)) * (dH / (kH * SH));
    return Math.sqrt(dE);
}
