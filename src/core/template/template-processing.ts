import type { PaletteItem } from '@/core/pxls-api/schemas/info.ts';
import {
    detemplatizeImageImpl,
    highlightIncorrectColorsImpl,
    mapColorsToPaletteImpl,
} from '@/core/template/template-processing-impl.ts';
import type {
    TemplateProcessingKeyedRequestMessage,
    TemplateProcessingMessageMap,
    TemplateProcessingRequest,
    TemplateProcessingResponse,
    TemplateProcessingResponseMessage,
} from '@/workers/template-processing.types.ts';

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
    transfer: Transferable[] = [],
): Promise<TemplateProcessingResponse<TaskKey>> {
    const worker = getTemplateProcessingWorker();
    const taskId = crypto.randomUUID() as string;
    const message: TemplateProcessingKeyedRequestMessage<TaskKey> = {
        type: requestType,
        id: taskId,
        payload: request,
    };
    const { promise, resolve } = Promise.withResolvers<TemplateProcessingResponse<TaskKey>>();
    const messageHandler = (event: MessageEvent<TemplateProcessingResponseMessage>): void => {
        if (event.data.type === requestType && event.data.id === taskId) {
            worker.removeEventListener('message', messageHandler);
            resolve(event.data.payload);
        }
    };
    worker.addEventListener('message', messageHandler);
    worker.postMessage(message, { transfer });
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
        const response = await performWorkerTask('colorMap', { image, palette }, [image.data.buffer]);
        if (response.success) {
            return response.image;
        } else {
            throw response.error;
        }
    }
    return mapColorsToPaletteImpl(image, palette);
}

export async function highlightIncorrectColors(image: ImageData, palette: PaletteItem[]): Promise<ImageData> {
    if (imageIsLarge(image)) {
        const response = await performWorkerTask('highlightIncorrectColors', { image, palette }, [image.data.buffer]);
        if (response.success) {
            return response.image;
        } else {
            throw response.error;
        }
    }
    return highlightIncorrectColorsImpl(image, palette);
}

export async function detemplatizeImage(image: ImageData, targetWidth: number): Promise<ImageData> {
    if (imageIsLarge(image)) {
        const response = await performWorkerTask('detemplatize', { image, targetWidth }, [image.data.buffer]);
        if (response.success) {
            return response.image;
        } else {
            throw response.error;
        }
    }
    return detemplatizeImageImpl(image, targetWidth);
}
