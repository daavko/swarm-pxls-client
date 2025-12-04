import { RenderLayer, type RenderLayerOptions } from '@/core/canvas-renderer/render-layer.ts';
import { Uint32RenderableTextureData } from '@/core/canvas-renderer/renderables/renderable-texture-data.ts';
import { SimpleQuadRenderable } from '@/core/canvas-renderer/renderables/simple-quad-renderable.ts';
import simpleRectVertexShaderSource from '@/core/canvas-renderer/shaders/simple-rect.vert?raw';
import simpleTextureFragmentShaderSource from '@/core/canvas-renderer/shaders/simple-texture.frag?raw';
import { useBoardStore } from '@/core/canvas/board.store.ts';
import { useBoardInitEventBus, useBoardResetEventBus, usePixelEventBus } from '@/core/canvas/event-buses.ts';
import type { Fn } from '@vueuse/core';

class BoardRenderable extends SimpleQuadRenderable {
    protected activeProgram: WebGLProgram;

    private readonly boardInitOff: Fn;
    private readonly boardResetOff: Fn;
    private readonly pixelPlacedOff: Fn;

    constructor(gl: WebGL2RenderingContext) {
        const boardStore = useBoardStore();
        const boardInitEventBus = useBoardInitEventBus();
        const boardResetEventBus = useBoardResetEventBus();
        const pixelPlacedEventBus = usePixelEventBus();

        const textureData = new Uint32RenderableTextureData();
        let initialWidth = 0;
        let initialHeight = 0;
        if (boardStore.board != null) {
            initialWidth = boardStore.board.imageData.width;
            initialHeight = boardStore.board.imageData.height;
            textureData.createBlankTextureData(initialWidth, initialHeight);
            textureData.data!.set(boardStore.board.uint32View);
        }
        super(gl, new DOMRect(0, 0, initialWidth, initialHeight), textureData);

        this.activeProgram = this.createProgram(simpleRectVertexShaderSource, simpleTextureFragmentShaderSource);

        this.boardInitOff = boardInitEventBus.on(({ board: { width, height, data } }) => {
            textureData.createBlankTextureData(width, height);
            textureData.data!.set(new Uint32Array(data.buffer));
            this.width = width;
            this.height = height;
        });
        this.boardResetOff = boardResetEventBus.on(() => {
            textureData.resetTextureData();
        });
        this.pixelPlacedOff = pixelPlacedEventBus.on(({ x, y, colorRawRgba }) => {
            textureData.setPixel(x, y, colorRawRgba);
        });
    }

    override destroy(): void {
        this.boardInitOff();
        this.boardResetOff();
        this.pixelPlacedOff();
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
