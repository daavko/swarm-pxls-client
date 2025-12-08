import type { GenericSchema } from 'valibot';
import * as v from 'valibot';

export interface ApiSuccessResponse<T> {
    success: true;
    response: Response;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    response?: Response;
    error: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

function buildApiFetchUrl(path: string, searchParams?: URLSearchParams): URL {
    const url = new URL(`${__PXLS_API_BASE_URL__}${path}`, window.location.origin);
    if (searchParams) {
        url.search = searchParams.toString();
    }
    return url;
}

interface ApiFetchOptionsExtras {
    searchParams?: URLSearchParams;
}

type ApiFetchOptions = RequestInit & ApiFetchOptionsExtras;

export async function apiFetch<TInput, TOutput>(
    path: string,
    schema: GenericSchema<TInput, TOutput>,
    options: ApiFetchOptions = {},
): Promise<ApiResponse<TOutput>> {
    const { searchParams, ...fetchOptions } = options;
    let response: Response;
    try {
        response = await fetch(buildApiFetchUrl(path, searchParams), {
            credentials: 'include',
            ...fetchOptions,
        });
    } catch (e) {
        return {
            success: false,
            error: e,
        };
    }
    if (response.status >= 400 && response.status <= 599) {
        return {
            success: false,
            response,
            error: `API request failed with status ${response.status}`,
        };
    }
    const data = await response.json();
    const parseResult = v.safeParse(schema, data);
    if (parseResult.success) {
        return {
            success: true,
            response,
            data: parseResult.output,
        };
    } else {
        return {
            success: false,
            response,
            error: parseResult.issues,
        };
    }
}

export async function binaryApiFetch(path: string, options: ApiFetchOptions = {}): Promise<ApiResponse<ArrayBuffer>> {
    const { searchParams, ...fetchOptions } = options;
    let response: Response;
    try {
        response = await fetch(buildApiFetchUrl(path, searchParams), {
            credentials: 'include',
            ...fetchOptions,
        });
    } catch (e) {
        return {
            success: false,
            error: e,
        };
    }
    if (response.status >= 400 && response.status <= 599) {
        return {
            success: false,
            response,
            error: `API request failed with status ${response.status}`,
        };
    }
    const data = await response.arrayBuffer();
    return {
        success: true,
        response,
        data,
    };
}
