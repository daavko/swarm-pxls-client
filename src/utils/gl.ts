export function compileShader(
    gl: WebGL2RenderingContext,
    source: string,
    shaderType: WebGL2RenderingContext['VERTEX_SHADER'] | WebGL2RenderingContext['FRAGMENT_SHADER'],
): WebGLShader {
    const shader = gl.createShader(shaderType);
    if (shader == null) {
        throw new Error('Failed to create shader');
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- safe
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS) as boolean;
    if (success) {
        return shader;
    } else {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('Failed to compile shader', { cause: info });
    }
}

export function createProgram(
    gl: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
): WebGLProgram {
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- safe
    const success = gl.getProgramParameter(program, gl.LINK_STATUS) as boolean;

    if (success) {
        return program;
    } else {
        const info = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error('Failed to link program', { cause: info });
    }
}
