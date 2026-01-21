import { logDebugMessage } from '@/core/logger/debug-log.ts';
import { fetchImageViaProxy } from '@/core/image-proxy/image-proxy-fetch.ts';

interface TemplateFetchSuccessResponse {
    success: true;
    templateImage: ImageData;
}

interface TemplateFetchErrorResponse {
    success: false;
    error: Error;
}

export type TemplateFetchResponse = TemplateFetchSuccessResponse | TemplateFetchErrorResponse;

export async function fetchTemplateImage(url: string): Promise<TemplateFetchResponse> {
    let response: Response | null;
    try {
        response = await fetch(url, { method: 'GET' });
    } catch (e: unknown) {
        logDebugMessage(['Template fetch failed', e]);
        response = null;
    }

    response ??= fetchImageViaProxy(url);
}
