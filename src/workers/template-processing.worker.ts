import type { PaletteItem } from '@/core/pxls-api/schemas/info.ts';
import {
    detemplatizeImageImpl,
    highlightIncorrectColorsImpl,
    mapColorsToPaletteImpl,
} from '@/core/template/template-processing-impl.ts';
import type {
    TemplateProcessingKeyedResponseMessage,
    TemplateProcessingMessageMap,
    TemplateProcessingRequestMessage,
    TemplateProcessingResponse,
} from '@/workers/template-processing.types.ts';

globalThis.addEventListener(
    'message',
    ({ data: { type, id, payload } }: MessageEvent<TemplateProcessingRequestMessage>) => {
        switch (type) {
            case 'colorMap':
                mapColorsToPalette(id, payload.image, payload.palette);
                break;
            case 'highlightIncorrectColors':
                highlightIncorrectColors(id, payload.image, payload.palette);
                break;
            case 'detemplatize':
                detemplatizeImage(id, payload.image, payload.targetWidth);
                break;
        }
    },
);

function sendResponse<TaskKey extends keyof TemplateProcessingMessageMap>(
    type: TaskKey,
    taskId: string,
    response: NoInfer<TemplateProcessingResponse<TaskKey>>,
    transfer: Transferable[] = [],
): void {
    const message = {
        type,
        id: taskId,
        payload: response,
    } satisfies TemplateProcessingKeyedResponseMessage<TaskKey>;
    globalThis.postMessage(message, { transfer });
}

function mapColorsToPalette(taskId: string, image: ImageData, palette: PaletteItem[]): void {
    try {
        const result = mapColorsToPaletteImpl(image, palette);
        sendResponse('colorMap', taskId, { success: true, image: result }, [result.data.buffer]);
    } catch (e: unknown) {
        if (e instanceof Error) {
            sendResponse('colorMap', taskId, { success: false, error: e });
        } else {
            sendResponse('colorMap', taskId, {
                success: false,
                error: new Error('Unknown error occurred', { cause: e }),
            });
        }
    }
}

function highlightIncorrectColors(taskId: string, image: ImageData, palette: PaletteItem[]): void {
    try {
        const result = highlightIncorrectColorsImpl(image, palette);
        sendResponse('highlightIncorrectColors', taskId, { success: true, image: result }, [result.data.buffer]);
    } catch (e: unknown) {
        if (e instanceof Error) {
            sendResponse('highlightIncorrectColors', taskId, { success: false, error: e });
        } else {
            sendResponse('highlightIncorrectColors', taskId, {
                success: false,
                error: new Error('Unknown error occurred', { cause: e }),
            });
        }
    }
}

function detemplatizeImage(taskId: string, image: ImageData, targetWidth: number): void {
    try {
        const result = detemplatizeImageImpl(image, targetWidth);
        sendResponse('detemplatize', taskId, { success: true, image: result }, [result.data.buffer]);
    } catch (e: unknown) {
        if (e instanceof Error) {
            sendResponse('detemplatize', taskId, { success: false, error: e });
        } else {
            sendResponse('detemplatize', taskId, {
                success: false,
                error: new Error('Unknown error occurred', { cause: e }),
            });
        }
    }
}
