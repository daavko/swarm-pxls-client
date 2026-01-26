import type { PaletteItem } from '@/core/pxls-api/schemas/info.ts';
import type {
    TemplateProcessingMessageMap,
    TemplateProcessingRequest,
    TemplateProcessingRequestMessage,
    TemplateProcessingResponse,
    TemplateProcessingResponseMessage,
} from '@/workers/template-processing.types.ts'; // todo: adjust this to a suitable value

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

async function performWorkerTask<TaskKey extends keyof TemplateProcessingMessageMap>(
    requestType: TaskKey,
    request: NoInfer<TemplateProcessingRequest<TaskKey>>,
): Promise<TemplateProcessingResponse<TaskKey>> {
    const worker = getTemplateProcessingWorker();
    const taskId = crypto.randomUUID() as string;
    const message: TemplateProcessingRequestMessage<TaskKey> = {
        type: requestType,
        id: taskId,
        payload: request,
    };
    const { promise, resolve } = Promise.withResolvers<TemplateProcessingResponse<TaskKey>>();
    const messageHandler = (event: MessageEvent<TemplateProcessingResponseMessage<TaskKey>>): void => {
        if (event.data.type === requestType && event.data.id === taskId) {
            worker.removeEventListener('message', messageHandler);
            resolve(event.data.payload);
        }
    };
    worker.addEventListener('message', messageHandler);
    worker.postMessage(message);
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
        const response = await performWorkerTask('colorMap', { image, palette });
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
        const response = await performWorkerTask('detemplatize', { image });
        if (response.success) {
            return response.image;
        } else {
            throw response.error;
        }
    }
    // todo
}
