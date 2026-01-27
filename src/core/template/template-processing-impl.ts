import { ciede2000, rawSrgbaToLab, srgbaToLab } from '@/core/color.ts';
import type { PaletteItem } from '@/core/pxls-api/schemas/info.ts';

export function mapColorsToPaletteImpl(image: ImageData, palette: PaletteItem[]): ImageData {
    const uint32View = new Uint32Array(image.data.buffer);

    const LBuffer = Array.from({ length: image.width * image.height }, () => 0);
    const aStarBuffer = Array.from({ length: image.width * image.height }, () => 0);
    const bStarBuffer = Array.from({ length: image.width * image.height }, () => 0);

    srgbaToLab(image.data, LBuffer, aStarBuffer, bStarBuffer);

    const paletteLab = palette.map((item) => rawSrgbaToLab(item.rawRgba));

    for (let i = 0; i < uint32View.length; i++) {
        const baseIndex = i * 4;
        const a = image.data[baseIndex + 3]!;
        if (a === 0) {
            continue;
        } else if (a !== 255) {
            throw new Error('Pixel has alpha value other than 0 or 255', {
                cause: { index: i, a },
            });
        }

        const bestMatch = palette.reduce<{ item: PaletteItem; distance: number } | null>((best, item, index) => {
            const [pL, pAStar, pBStar] = paletteLab[index]!;
            const deltaE = ciede2000(LBuffer[i]!, aStarBuffer[i]!, bStarBuffer[i]!, pL, pAStar, pBStar);
            if (best == null || deltaE < best.distance) {
                return { item, distance: deltaE };
            } else {
                return best;
            }
        }, null);
        if (bestMatch == null) {
            throw new Error('No best match found for pixel', { cause: { index: i } });
        }
        uint32View[i] = bestMatch.item.rawRgba;
    }
    return image;
}

export function highlightIncorrectColorsImpl(image: ImageData, palette: PaletteItem[]): ImageData {
    const uint32View = new Uint32Array(image.data.buffer);

    for (let i = 0; i < uint32View.length; i++) {
        const baseIndex = i * 4;
        const pixelColor = uint32View[i]!;
        const a = image.data[baseIndex + 3]!;
        if (a === 0) {
            continue;
        } else if (a !== 255) {
            throw new Error('Pixel has alpha value other than 0 or 255', {
                cause: { index: i, a },
            });
        }

        const matchesPalette = palette.some((item) => item.rawRgba === pixelColor);
        if (matchesPalette) {
            const r = image.data[baseIndex]!;
            const g = image.data[baseIndex + 1]!;
            const b = image.data[baseIndex + 2]!;
            image.data[baseIndex] = Math.floor(r * 0.25);
            image.data[baseIndex + 1] = Math.floor(g * 0.25);
            image.data[baseIndex + 2] = Math.floor(b * 0.25);
        } else {
            // red with full alpha
            uint32View[i] = 0xff0000ff;
        }
    }
    return image;
}

export function detemplatizeImageImpl(image: ImageData, targetWidth: number): ImageData {
    const cellSize = image.width / targetWidth;
    const targetHeight = image.height / cellSize;

    if (!Number.isInteger(cellSize)) {
        throw new Error('Template image width does not divide evenly by target width', {
            cause: { width: image.width, targetWidth, cellSize },
        });
    } else if (!Number.isInteger(targetHeight)) {
        throw new Error('Template image height does not divide evenly by cell size', {
            cause: { height: image.height, targetHeight, cellSize },
        });
    }

    const targetImage = new ImageData(targetWidth, targetHeight);
    const imageUInt32View = new Uint32Array(image.data.buffer);
    const targetImageUInt32View = new Uint32Array(targetImage.data.buffer);

    for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
            const color = getCellColor(image, imageUInt32View, x * cellSize, y * cellSize, cellSize);
            if (color != null) {
                const i = y * targetWidth + x;
                targetImageUInt32View[i] = color;
            }
        }
    }

    return targetImage;
}

function getCellColor(
    imageData: ImageData,
    uInt32View: Uint32Array,
    x: number,
    y: number,
    cellSize: number,
): number | null {
    const { width } = imageData;
    let pixel: number | null = null;

    for (let blockY = 0; blockY < cellSize; blockY++) {
        const rowStart = (y + blockY) * width;
        for (let blockX = 0; blockX < cellSize; blockX++) {
            const pixelIndex = rowStart + (x + blockX);
            const pixelColor = uInt32View[pixelIndex]!;
            const a = imageData.data[pixelIndex * 4 + 3]!;
            if (a === 0) {
                continue;
            } else if (a !== 255) {
                throw new Error('Pixel block for downscaling has alpha value other than 0 or 255', {
                    cause: { x, y, cellSize, a },
                });
            }

            if (pixel != null) {
                if (pixel !== pixelColor) {
                    // the pixels are packed as AABBGGRR because little-endian
                    const previousB = (pixel >> 16) & 0xff;
                    const previousG = (pixel >> 8) & 0xff;
                    const previousR = pixel & 0xff;
                    const b = (pixelColor >> 16) & 0xff;
                    const g = (pixelColor >> 8) & 0xff;
                    const r = pixelColor & 0xff;
                    throw new Error('Pixel block for downscaling has more than one color.', {
                        cause: { x, y, blockX, blockY, cellSize, previousR, previousG, previousB, r, g, b },
                    });
                }
            } else {
                pixel = pixelColor;
            }
        }
    }

    return pixel;
}
