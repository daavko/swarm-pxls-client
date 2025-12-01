export abstract class Renderable {
    protected readonly gl: WebGL2RenderingContext;

    protected constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    abstract render(projectionMatrixUniform: Float32Array): void;
    abstract destroy(gl: WebGL2RenderingContext): void;
}
