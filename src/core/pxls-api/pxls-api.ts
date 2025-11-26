import { apiFetch, type ApiResponse, binaryApiFetch } from '@/core/pxls-api/api-fetch.ts';
import { InfoResponse } from '@/core/pxls-api/schemas/info.ts';

const TIMEOUT_MS = 5000;

let inFlightInfoRequest: Promise<ApiResponse<InfoResponse>> | null = null;
let inFlightBoardDataRequest: Promise<ApiResponse<ArrayBuffer>> | null = null;

export const PxlsApi = {
    async fetchInfo(): Promise<ApiResponse<InfoResponse>> {
        inFlightInfoRequest ??= apiFetch('/info', InfoResponse, { signal: AbortSignal.timeout(TIMEOUT_MS) }).finally(
            () => {
                inFlightInfoRequest = null;
            },
        );
        return inFlightInfoRequest;
    },
    async fetchBoardData(): Promise<ApiResponse<ArrayBuffer>> {
        inFlightBoardDataRequest ??= binaryApiFetch('/boarddata', { signal: AbortSignal.timeout(TIMEOUT_MS) }).finally(
            () => {
                inFlightBoardDataRequest = null;
            },
        );
        return inFlightBoardDataRequest;
    },
    async startAuthFlow(): Promise<ApiResponse<void>> {},
    async finishAuthFlow(): Promise<ApiResponse<void>> {},
    async logout(): Promise<ApiResponse<void>> {},
};
