import { Renderable } from '@/core/canvas-renderer/renderables/renderable.ts';
import { compileShader, createProgram } from '@/utils/gl.ts';

export abstract class QuadRenderable extends Renderable {
    protected _rect: DOMRect;

    private readonly vertexBuffer: WebGLBuffer;
    private vertexBufferData: Float32Array;
    private readonly vao: WebGLVertexArrayObject;
    private readonly texCoordBuffer: WebGLBuffer;
    private readonly texCoordBufferData = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
    ]);

    protected abstract activeProgram: WebGLProgram;

    protected constructor(gl: WebGL2RenderingContext, rect: DOMRect) {
        super(gl);

        // copy to avoid external mutations
        this._rect = DOMRect.fromRect(rect);
        this.vertexBuffer = gl.createBuffer();
        this.vertexBufferData = this.createVertexBufferData();
        this.vao = gl.createVertexArray();
        this.texCoordBuffer = gl.createBuffer();
    }

    get rect(): DOMRectReadOnly {
        return this._rect;
    }

    set x(value: number) {
        this._rect.x = value;
        this.updateVertexBufferData();
    }

    set y(value: number) {
        this._rect.y = value;
        this.updateVertexBufferData();
    }

    protected set width(value: number) {
        this._rect.width = value;
        this.updateVertexBufferData();
    }

    protected set height(value: number) {
        this._rect.height = value;
        this.updateVertexBufferData();
    }

    override render(projectionMatrixUniform: Float32Array): void {
        this.prepareRenderingContext(projectionMatrixUniform);

        const { gl } = this;
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        this.teardownRenderingContext();
    }

    override destroy(gl: WebGL2RenderingContext): void {
        gl.deleteProgram(this.activeProgram);
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.texCoordBuffer);
        gl.deleteVertexArray(this.vao);
    }

    protected createProgram(vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram {
        const vertexShader = compileShader(this.gl, vertexShaderSource, this.gl.VERTEX_SHADER);
        const fragmentShader = compileShader(this.gl, fragmentShaderSource, this.gl.FRAGMENT_SHADER);
        return createProgram(this.gl, vertexShader, fragmentShader);
    }

    protected prepareRenderingContext(projectionMatrixUniform: Float32Array): void {
        const { activeProgram, gl, vao } = this;

        gl.bindVertexArray(vao);
        this.bindBuffers();

        gl.useProgram(activeProgram);
        gl.bindVertexArray(vao);
        this.fillBufferData();
        this.setUniforms(projectionMatrixUniform);
    }

    protected teardownRenderingContext(): void {
        const { gl } = this;

        this.unbindBuffers();
        gl.useProgram(null);
    }

    protected bindBuffers(): void {
        const { activeProgram, gl, vertexBuffer, texCoordBuffer } = this;

        const positionLocation = gl.getAttribLocation(activeProgram, 'a_position');
        const texCoordLocation = gl.getAttribLocation(activeProgram, 'a_texCoord');

        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(texCoordLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.texCoordBufferData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    }

    protected unbindBuffers(): void {
        const { gl } = this;
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    protected fillBufferData(): void {
        const { gl, vertexBuffer } = this;
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexBufferData, gl.DYNAMIC_DRAW);
    }

    protected setUniforms(projectionMatrixUniform: Float32Array): void {
        const { activeProgram, gl } = this;
        const projectionMatrixLocation = gl.getUniformLocation(activeProgram, 'u_matrix');
        gl.uniformMatrix3fv(projectionMatrixLocation, false, projectionMatrixUniform);
    }

    private createVertexBufferData(): Float32Array {
        const { left: x1, top: y1, right: x2, bottom: y2 } = this.rect;
        return new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]);
    }

    private updateVertexBufferData(): void {
        this.vertexBufferData = this.createVertexBufferData();
    }
}
