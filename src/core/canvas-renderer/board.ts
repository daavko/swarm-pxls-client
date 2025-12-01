import { RenderLayer, type RenderLayerOptions } from '@/core/canvas-renderer/render-layer.ts';
import { SimpleQuadRenderable } from '@/core/canvas-renderer/renderables/simple-quad-renderable.ts';
import { Uint32RenderableTextureData } from '@/core/canvas-renderer/renderables/renderable-texture-data.ts';

class BoardRenderable extends SimpleQuadRenderable {
    protected activeProgram: WebGLProgram;

    constructor(gl: WebGL2RenderingContext, imageData: ImageData) {
        const textureData = new Uint32RenderableTextureData();
        textureData.useTextureData(new Uint32Array(imageData.data.buffer), imageData.width, imageData.height);
        super(gl, new DOMRect(0, 0, imageData.width, imageData.height), textureData);

        this.activeProgram = this.createProgram('', '');
    }
}

export class BoardLayer extends RenderLayer {
    readonly name: string = 'board';
    readonly title: string = 'Board';
    readonly defaultOptions: Readonly<RenderLayerOptions> = {
        name: this.name,
        opacity: 1,
        enabled: true,
    };

    private readonly imageData: ImageData;

    constructor(imageData: ImageData) {
        super();

        this.imageData = imageData;
    }

    createRenderables(gl: WebGL2RenderingContext): void {
        this.renderables = [new BoardRenderable(gl, this.imageData)];
    }
}
