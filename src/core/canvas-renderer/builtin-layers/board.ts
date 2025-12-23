import { RenderLayer, type RenderLayerOptions } from '@/core/canvas-renderer/render-layer.ts';
import { Uint32RenderableTextureData } from '@/core/canvas-renderer/renderables/renderable-texture-data.ts';
import { SimpleQuadRenderable } from '@/core/canvas-renderer/renderables/simple-quad-renderable.ts';
import simpleRectVertexShaderSource from '@/core/canvas-renderer/shaders/simple-rect.vert?raw';
import simpleTextureFragmentShaderSource from '@/core/canvas-renderer/shaders/simple-texture.frag?raw';
import { useBoardStore } from '@/core/canvas/board.store.ts';
import { useBoardInitEventBus, useBoardResetEventBus, usePixelEventBus } from '@/core/canvas/event-buses.ts';
import { effectScope, type EffectScope } from 'vue';

class BoardRenderable extends SimpleQuadRenderable {
    protected activeProgram: WebGLProgram;

    private readonly effectScope: EffectScope;

    constructor(gl: WebGL2RenderingContext) {
        const boardStore = useBoardStore();

        const textureData = new Uint32RenderableTextureData();
        let initialWidth = 0;
        let initialHeight = 0;
        if (boardStore.board) {
            initialWidth = boardStore.board.imageData.width;
            initialHeight = boardStore.board.imageData.height;
            textureData.createBlankTextureData(initialWidth, initialHeight);
            textureData.data!.set(boardStore.board.uint32View);
        }
        super(gl, new DOMRect(0, 0, initialWidth, initialHeight), textureData);

        this.activeProgram = this.createProgram(simpleRectVertexShaderSource, simpleTextureFragmentShaderSource);

        this.effectScope = effectScope(true);

        this.effectScope.run(() => {
            const boardInitEventBus = useBoardInitEventBus();
            const boardResetEventBus = useBoardResetEventBus();
            const pixelPlacedEventBus = usePixelEventBus();

            boardInitEventBus.on(({ board: { width, height, data } }) => {
                textureData.useTextureData(new Uint32Array(data.buffer), width, height);
                this.width = width;
                this.height = height;
            });
            boardResetEventBus.on(() => {
                textureData.resetTextureData();
            });
            pixelPlacedEventBus.on(({ x, y, colorRawRgba }) => {
                textureData.setPixel(x, y, colorRawRgba);
            });
        });
    }

    override destroy(): void {
        this.effectScope.stop();
        super.destroy();
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
        this.renderables = [new BoardRenderable(gl)];
    }
}
