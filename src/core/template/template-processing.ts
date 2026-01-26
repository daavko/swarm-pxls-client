import type { PaletteItem } from '@/core/pxls-api/schemas/info.ts';
import type {
    TemplateProcessingTaskRequest,
    TemplateProcessingTaskResponse,
} from '@/workers/template-processing.types.ts';

// todo: adjust this to a suitable value
const MAX_MAIN_THREAD_IMAGE_PIXELS = 100 * 100;

let templateProcessingWorker: Worker | null = null;

function getTemplateProcessingWorker(): Worker {
    templateProcessingWorker ??= new Worker(new URL('@/workers/template-processing.worker.ts', import.meta.url));
    return templateProcessingWorker;
}

function imageIsLarge(image: ImageData): boolean {
    return image.width * image.height > MAX_MAIN_THREAD_IMAGE_PIXELS;
}

function sendWorkerTask<T extends TemplateProcessingTaskRequest>(
    requestType: T['type'],
    request: T['payload'],
): string {
    const worker = getTemplateProcessingWorker();
    const taskId = crypto.randomUUID() as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- safe
    const message: T = {
        type: requestType,
        id: taskId,
        payload: request,
    } as T;
    worker.postMessage(message);
    return taskId;
}

async function waitForWorkerResponse<T extends TemplateProcessingTaskResponse>(
    taskType: T['type'],
    taskId: string,
): Promise<T['payload']> {
    const worker = getTemplateProcessingWorker();
    const { promise, resolve } = Promise.withResolvers<T['payload']>();
    const messageHandler = (event: MessageEvent<T>): void => {
        if (event.data.type === taskType && event.data.id === taskId) {
            worker.removeEventListener('message', messageHandler);
            resolve(event.data.payload);
        }
    };
    worker.addEventListener('message', messageHandler);
    return promise;
}

export async function downscaleImage(image: ImageData, width: number): Promise<ImageData> {
    const bitmap = await createImageBitmap(image, { resizeWidth: width, resizeQuality: 'high' });
    const canvas = new OffscreenCanvas(width, bitmap.height);
    const context = canvas.getContext('2d');
    if (!context) {
        bitmap.close();
        throw new Error('Failed to get canvas context');
    }
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    return context.getImageData(0, 0, width, bitmap.height);
}

export async function mapColorsToPalette(image: ImageData, palette: PaletteItem[]): Promise<ImageData> {
    if (imageIsLarge(image)) {
        const taskId = sendWorkerTask('colorMap', { image, palette });
        const response = await waitForWorkerResponse('colorMap', taskId);
        if (response.success) {
            return response.image;
        } else {
            throw response.error;
        }
    }
    // todo
}

export async function highlightIncorrectColors(image: ImageData, palette: PaletteItem[]): Promise<ImageData> {
    if (imageIsLarge(image)) {
        // todo: send correct task
    }
    // todo
}

export async function detemplatizeImage(image: ImageData, cellSize: number): Promise<ImageData> {
    if (imageIsLarge(image)) {
        const taskId = sendWorkerTask('detemplatize', { image });
        const response = await waitForWorkerResponse('detemplatize', taskId);
        if (response.success) {
            return response.image;
        } else {
            throw response.error;
        }
    }
    // todo
}
