import { useCanvasViewportStore } from '@/core/canvas-renderer/canvas-viewport.store.ts';
import { RenderLayer, type RenderLayerOptions } from '@/core/canvas-renderer/render-layer.ts';
import { QuadRenderable } from '@/core/canvas-renderer/renderables/quad-renderable.ts';
import reticleFragmentShaderSource from '@/core/canvas-renderer/shaders/reticle.frag?raw';
import simpleRectVertexShaderSource from '@/core/canvas-renderer/shaders/simple-rect.vert?raw';
import { useCanvasStore } from '@/core/canvas/canvas.store.ts';
import { abgrToVec4 } from '@/utils/color.ts';
import { storeToRefs } from 'pinia';
import { watch, type WatchHandle } from 'vue';

class ReticleRenderable extends QuadRenderable {
    protected activeProgram: WebGLProgram;

    private readonly sizeWatchOff: WatchHandle;
    private readonly selectedColorWatchOff: WatchHandle;

    private readonly borderWidth: number = 2;
    private selectedColor: [number, number, number, number] | null = null;
    private screenSpaceBorderCutoff: number | null = null;

    constructor(gl: WebGL2RenderingContext) {
        const { mouseBoardCoords, scale } = storeToRefs(useCanvasViewportStore());
        const { selectedColor } = storeToRefs(useCanvasStore());

        super(gl, new DOMRect(0, 0, 0, 0));

        this.activeProgram = this.createProgram(simpleRectVertexShaderSource, reticleFragmentShaderSource);

        this.sizeWatchOff = watch(
            [mouseBoardCoords, scale],
            ([coords, newScale]) => {
                if (!coords || newScale == null) {
                    this.width = 0;
                    this.height = 0;
                    return;
                }
                const borderSizeInBoardCoords = this.borderWidth / newScale;
                this.x = coords.x - borderSizeInBoardCoords;
                this.y = coords.y - borderSizeInBoardCoords;
                this.width = 1 + borderSizeInBoardCoords * 2;
                this.height = 1 + borderSizeInBoardCoords * 2;
                this.screenSpaceBorderCutoff = 1 - this.borderWidth / (newScale + 2 * this.borderWidth);
            },
            { immediate: true },
        );
        this.selectedColorWatchOff = watch(selectedColor, (newColor) => {
            if (newColor == null) {
                this.selectedColor = null;
            } else {
                this.selectedColor = abgrToVec4(newColor.rawRgba);
            }
        });
    }

    override render(projectionMatrixUniform: Float32Array): void {
        if (!this.selectedColor || this.screenSpaceBorderCutoff == null) {
            return;
        }

        super.render(projectionMatrixUniform);
    }

    override destroy(): void {
        this.sizeWatchOff();
        this.selectedColorWatchOff();
        super.destroy();
    }

    protected override setUniforms(projectionMatrixUniform: Float32Array): void {
        super.setUniforms(projectionMatrixUniform);

        const { activeProgram, gl, selectedColor, screenSpaceBorderCutoff } = this;
        const colorLocation = gl.getUniformLocation(activeProgram, 'u_selectedColor');
        const borderCutoffLocation = gl.getUniformLocation(activeProgram, 'u_borderCutoff');
        gl.uniform4fv(colorLocation, selectedColor!);
        gl.uniform1f(borderCutoffLocation, screenSpaceBorderCutoff!);
    }
}

export class ReticleLayer extends RenderLayer {
    readonly name: string = 'reticle';
    readonly title: string = 'Reticle';
    readonly defaultOptions: Readonly<RenderLayerOptions> = {
        name: this.name,
        enabled: true,
        opacity: 1,
    };

    override createRenderables(gl: WebGL2RenderingContext): void {
        this.renderables = [new ReticleRenderable(gl)];
    }
}
