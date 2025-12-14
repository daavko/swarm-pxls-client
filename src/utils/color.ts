export function hexToAbgr(hex: string, hasPoundSign = true): number {
    const offset = hasPoundSign ? 1 : 0;
    const r = parseInt(hex.slice(0 + offset, 2 + offset), 16);
    const g = parseInt(hex.slice(2 + offset, 4 + offset), 16);
    const b = parseInt(hex.slice(4 + offset, 6 + offset), 16);
    const a = 255;
    return (a << 24) | (b << 16) | (g << 8) | r;
}

export function abgrToVec4(abgr: number): [number, number, number, number] {
    const a = (abgr >> 24) & 0xff;
    const b = (abgr >> 16) & 0xff;
    const g = (abgr >> 8) & 0xff;
    const r = abgr & 0xff;
    return [r / 255, g / 255, b / 255, a / 255];
}
