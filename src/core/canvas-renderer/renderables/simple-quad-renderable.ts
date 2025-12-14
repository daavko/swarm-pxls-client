import { QuadRenderable } from '@/core/canvas-renderer/renderables/quad-renderable.ts';
import {
    type ChangedRegionDefinition,
    RenderableTextureData,
} from '@/core/canvas-renderer/renderables/renderable-texture-data.ts';

export abstract class SimpleQuadRenderable extends QuadRenderable {
    private readonly texture: WebGLTexture;
    private readonly dataProvider: RenderableTextureData<Uint32Array>;
    private textureInitialized = false;

    protected constructor(gl: WebGL2RenderingContext, rect: DOMRect, dataProvider: RenderableTextureData<Uint32Array>) {
        super(gl, rect);

        this.texture = gl.createTexture();
        this.dataProvider = dataProvider;
    }

    protected override get canRender(): boolean {
        return super.canRender && this.dataProvider.data != null;
    }

    protected override bindBuffers(): void {
        super.bindBuffers();

        const { gl, texture } = this;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    protected override unbindBuffers(): void {
        const { gl } = this;
        gl.bindTexture(gl.TEXTURE_2D, null);
        super.unbindBuffers();
    }

    protected override fillBufferData(): void {
        super.fillBufferData();
        if (!this.textureInitialized) {
            this.fillFullTextureData(this.gl);
            return;
        }

        const changed = this.dataProvider.dataChanged;
        if (typeof changed === 'boolean') {
            if (changed) {
                this.fillFullTextureData(this.gl);
                this.dataProvider.clearDataChanged();
            }
        } else {
            if (changed.length > 0) {
                this.fillPartialTextureData(this.gl, changed);
                this.dataProvider.clearDataChanged();
            }
        }
    }

    protected override setUniforms(projectionMatrixUniform: Float32Array): void {
        super.setUniforms(projectionMatrixUniform);

        const { activeProgram, gl } = this;
        const textureLocation = gl.getUniformLocation(activeProgram, 'u_texture');
        gl.uniform1i(textureLocation, 0);
    }

    private fillFullTextureData(gl: WebGL2RenderingContext): void {
        const data = this.dataProvider.data;
        if (!data) {
            return;
        }

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.rect.width,
            this.rect.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array(data.buffer),
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        this.textureInitialized = true;
    }

    private fillPartialTextureData(gl: WebGL2RenderingContext, changedRegions: ChangedRegionDefinition[]): void {
        const data = this.dataProvider.data;
        if (!data) {
            return;
        }

        const glTextureView = new Uint8Array(data.buffer);
        for (const region of changedRegions) {
            let regionStart: number;
            let regionHeight: number;
            if (typeof region === 'number') {
                regionStart = region;
                regionHeight = 1;
            } else {
                [regionStart, regionHeight] = region;
            }
            const subView = this.createTextureSubview(glTextureView, regionStart, regionHeight);
            gl.texSubImage2D(
                gl.TEXTURE_2D,
                0,
                0,
                regionStart,
                this.rect.width,
                regionHeight,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                subView,
            );
            gl.generateMipmap(gl.TEXTURE_2D);
        }
    }

    private createTextureSubview(textureData: Uint8Array, y: number, height: number): Uint8Array {
        return textureData.subarray(y * this.rect.width * 4, (y + height) * this.rect.width * 4);
    }
}
