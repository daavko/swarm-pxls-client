export function getViewportTransformMatrix(
    canvasWidth: number,
    canvasHeight: number,
    tx: number,
    ty: number,
    scale: number,
    existingMatrix?: Float32Array | null,
): Float32Array {
    const matrix = existingMatrix ?? new Float32Array(9);

    matrix[0] = (2 / canvasWidth) * scale;
    matrix[1] = 0;
    matrix[2] = 0;

    matrix[3] = 0;
    matrix[4] = (-2 / canvasHeight) * scale;
    matrix[5] = 0;

    matrix[6] = tx * (2 / canvasWidth) + -1;
    matrix[7] = ty * (-2 / canvasHeight) + 1;
    matrix[8] = 1;

    return matrix;
}
