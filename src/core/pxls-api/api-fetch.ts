import { PXLS_API_HOST } from '@/core/pxls-api/const.ts';
import type { GenericSchema } from 'valibot';
import * as v from 'valibot';

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    error: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export async function apiFetch<TInput, TOutput>(
    path: string,
    schema: GenericSchema<TInput, TOutput>,
    options: RequestInit = {},
): Promise<ApiResponse<TOutput>> {
    let response: Response;
    try {
        response = await fetch(`https://${PXLS_API_HOST}/pxls${path}`, options);
    } catch (e) {
        return {
            success: false,
            error: e,
        };
    }
    if (response.status >= 400 && response.status <= 599) {
        return {
            success: false,
            error: `API request failed with status ${response.status}`,
        };
    }
    const data = await response.json();
    const parseResult = v.safeParse(schema, data);
    if (parseResult.success) {
        return {
            success: true,
            data: parseResult.output,
        };
    } else {
        return {
            success: false,
            error: parseResult.issues,
        };
    }
}

export async function binaryApiFetch(path: string, options: RequestInit = {}): Promise<ApiResponse<ArrayBuffer>> {
    let response: Response;
    try {
        response = await fetch(`https://${PXLS_API_HOST}/pxls${path}`, options);
    } catch (e) {
        return {
            success: false,
            error: e,
        };
    }
    if (response.status >= 400 && response.status <= 599) {
        return {
            success: false,
            error: `API request failed with status ${response.status}`,
        };
    }
    const data = await response.arrayBuffer();
    return {
        success: true,
        data,
    };
}
