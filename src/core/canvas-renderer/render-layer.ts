import type { Renderable } from '@/core/canvas-renderer/renderables/renderable.ts';

export abstract class RenderLayer {
    protected renderables: Renderable[] = [];

    abstract readonly name: string;
    abstract readonly title: string;
    abstract readonly defaultOptions: Readonly<RenderLayerOptions>;

    render(projectionMatrixUniform: Float32Array): void {
        for (const renderable of this.renderables) {
            renderable.render(projectionMatrixUniform);
        }
    }

    destroyRenderables(): void {
        for (const renderable of this.renderables) {
            renderable.destroy();
        }
        this.renderables = [];
    }

    abstract createRenderables(gl: WebGL2RenderingContext): void;
}

export interface RenderLayerOptions {
    name: string;
    opacity: number;
    enabled: boolean;
}
