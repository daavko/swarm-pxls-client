export abstract class RenderLayer {
    readonly name: string;
    readonly title: string;

    constructor(name: string, title: string) {
        this.name = name;
        this.title = title;
    }

    abstract createRenderables(gl: WebGL2RenderingContext): void;
    abstract destroyRenderables(): void;
    abstract render(projectionMatrixUniform: Float32Array): void;
}
