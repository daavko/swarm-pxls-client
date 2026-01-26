import { IMAGE_PROXY_HOST } from '@/core/image-api/const.ts';
import { logDebugMessage } from '@/core/logger/debug-log.ts';

export interface ImageFetchSuccessResponse {
    success: true;
    data: ImageData;
}

export interface ImageFetchErrorResponse {
    success: false;
    error: Error;
}

export type ImageFetchResponse = ImageFetchSuccessResponse | ImageFetchErrorResponse;

export async function fetchImage(imageUrl: string, options: RequestInit = {}): Promise<ImageFetchResponse> {
    let response: Response | undefined;
    try {
        response = await fetch(imageUrl, {
            ...options,
            method: 'GET',
        });
    } catch (e: unknown) {
        logDebugMessage(['Image fetch failed, retrying via proxy...', e]);
    }

    if (!response) {
        try {
            response = await fetch(`https://${IMAGE_PROXY_HOST}/imageproxy/${encodeURIComponent(imageUrl)}`, {
                ...options,
                method: 'GET',
            });
        } catch (e: unknown) {
            return {
                success: false,
                error: new Error('Image proxy request failed', { cause: e }),
            };
        }
    }

    if (!response.ok) {
        return {
            success: false,
            error: new Error(`Image request failed with status ${response.status}`),
        };
    }

    const blob = await response.blob();
    let imageBitmap: ImageBitmap;
    try {
        imageBitmap = await createImageBitmap(blob);
    } catch (e: unknown) {
        return {
            success: false,
            error: new Error('Failed to create ImageBitmap from blob', { cause: e }),
        };
    }

    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const context = canvas.getContext('2d');
    if (!context) {
        return {
            success: false,
            error: new Error('Failed to get canvas context'),
        };
    }

    context.drawImage(imageBitmap, 0, 0);
    const imageData = context.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
    imageBitmap.close();
    return {
        success: true,
        data: imageData,
    };
}
