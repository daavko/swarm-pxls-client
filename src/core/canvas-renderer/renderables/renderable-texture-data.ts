import type { Size } from '@/utils/geometry.ts';

type TextureDataArray = Uint32Array | Uint8Array | Uint16Array;

// a number indicates the y-coordinate of a changed row
// a tuple [yStart, height] indicates a range of changed rows
export type ChangedRegionDefinition = number | [number, number];

export abstract class RenderableTextureData<T extends TextureDataArray> {
    private textureData: T | null = null;
    private size: Size | null = null;
    private readonly changedRows = new Set<number>();
    private changed: boolean = false;

    get data(): T | null {
        return this.textureData;
    }

    get dataChanged(): boolean | ChangedRegionDefinition[] {
        if (this.changed) {
            return true;
        } else if (this.changedRows.size > 0) {
            const rows = Array.from(this.changedRows).sort((a, b) => a - b);

            const regions: ChangedRegionDefinition[] = [];

            function pushRange(rangeStart: number, rangeEnd: number): void {
                if (rangeStart === rangeEnd) {
                    regions.push(rangeStart);
                } else {
                    regions.push([rangeStart, rangeEnd - rangeStart + 1]);
                }
            }

            let rangeStart: number | null = null;
            let rangeEnd: number | null = null;
            for (const row of rows) {
                if (rangeStart === null && rangeEnd === null) {
                    rangeStart = row;
                    rangeEnd = row;
                    continue;
                }

                if (rangeStart != null && rangeEnd != null) {
                    if (row === rangeEnd + 1) {
                        rangeEnd = row;
                    } else {
                        pushRange(rangeStart, rangeEnd);
                        rangeStart = row;
                        rangeEnd = row;
                    }
                }
            }
            if (rangeStart !== null && rangeEnd !== null) {
                pushRange(rangeStart, rangeEnd);
            }
            return regions;
        } else {
            return false;
        }
    }

    createBlankTextureData(width: number, height: number): void {
        if (this.textureData) {
            this.changed = true;
        }
        this.size = { width, height };
        this.textureData = this.dataArrayCtor(width * height);
    }

    useTextureData(data: T, width: number, height: number): void {
        if (this.textureData) {
            this.changed = true;
        }
        this.size = { width, height };
        this.textureData = this.dataArrayCtor(width * height);
        this.textureData.set(data);
    }

    resetTextureData(): void {
        this.textureData = null;
        this.size = null;
        this.changed = false;
        this.changedRows.clear();
    }

    getPixelByIndex(index: number): number | undefined {
        return this.textureData?.at(index);
    }

    getPixel(x: number, y: number): number | undefined {
        const index = this.pointToIndex(x, y);
        if (index === null) {
            return undefined;
        }

        return this.textureData?.at(index);
    }

    setPixelByIndex(index: number, color: number): void {
        if (!this.size || !this.textureData || index < 0 || index >= this.textureData.length) {
            return;
        }

        this.textureData[index] = color;
        this.changedRows.add(Math.floor(index / this.size.width));
    }

    setPixel(x: number, y: number, color: number): void {
        if (!this.textureData) {
            return;
        }

        const index = this.pointToIndex(x, y);
        if (index === null) {
            return;
        }

        this.textureData[index] = color;
        this.changedRows.add(y);
    }

    clearDataChanged(): void {
        this.changed = false;
        this.changedRows.clear();
    }

    protected pointToIndex(x: number, y: number): number | null {
        if (!this.size) {
            return null;
        }

        if (x < 0 || x >= this.size.width || y < 0 || y >= this.size.height) {
            return null;
        }

        return y * this.size.width + x;
    }

    abstract dataArrayCtor(length: number): T;
}

export class Uint8RenderableTextureData extends RenderableTextureData<Uint8Array> {
    dataArrayCtor(length: number): Uint8Array {
        return new Uint8Array(length);
    }
}

export class Uint16RenderableTextureData extends RenderableTextureData<Uint16Array> {
    dataArrayCtor(length: number): Uint16Array {
        return new Uint16Array(length);
    }
}

export class Uint32RenderableTextureData extends RenderableTextureData<Uint32Array> {
    dataArrayCtor(length: number): Uint32Array {
        return new Uint32Array(length);
    }
}
