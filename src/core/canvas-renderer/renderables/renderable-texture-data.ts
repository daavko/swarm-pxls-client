import type { Size } from '@/utils/geometry.ts';

type TextureDataArray = Uint32Array | Uint8Array | Uint16Array;

// a number indicates the y-coordinate of a changed row
// a tuple [yStart, height] indicates a range of changed rows
export type ChangedRegionDefinition = number | [number, number];

export abstract class RenderableTextureData<T extends TextureDataArray> {
    private textureData: T | null = null;
    private size: Size | null = null;
    private changed: boolean = false;

    get data(): T | null {
        return this.textureData;
    }

    get dataChanged(): boolean | ChangedRegionDefinition[] {
        return this.changed;
    }

    createBlankTextureData(width: number, height: number): void {
        this.size = { width, height };
        this.textureData = this.dataArrayCtor(width * height);
    }

    useTextureData(data: T, width: number, height: number): void {
        this.size = { width, height };
        this.textureData = data;
    }

    getPixelByIndex(index: number): number | undefined {
        return this.textureData?.at(index);
    }

    getPixel(x: number, y: number): number | undefined {
        if (!this.size) {
            return undefined;
        }
        return this.getPixelByIndex(y * this.size.width + x);
    }

    setPixelByIndex(index: number, color: number): void {
        if (this.textureData) {
            this.textureData[index] = color;
            this.changed = true;
        }
    }

    setPixel(x: number, y: number, color: number): void {
        if (!this.size) {
            return;
        }
        this.setPixelByIndex(y * this.size.width + x, color);
    }

    clearDataChanged(): void {
        this.changed = false;
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
