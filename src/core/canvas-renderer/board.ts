import { RenderLayer, type RenderLayerOptions } from '@/core/canvas-renderer/render-layer.ts';
import { Uint32RenderableTextureData } from '@/core/canvas-renderer/renderables/renderable-texture-data.ts';
import { SimpleQuadRenderable } from '@/core/canvas-renderer/renderables/simple-quad-renderable.ts';

class BoardRenderable extends SimpleQuadRenderable {
    protected activeProgram: WebGLProgram;

    constructor(gl: WebGL2RenderingContext) {
        const textureData = new Uint32RenderableTextureData();
        textureData.useTextureData(board.uint32View, board.imageData.width, board.imageData.height);
        super(gl, new DOMRect(0, 0, 0, 0), textureData);

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

    createRenderables(gl: WebGL2RenderingContext): void {
        this.destroyRenderables();
        this.renderables = [new BoardRenderable(gl)];
    }
}
