import { apiFetch, type ApiResponse, binaryApiFetch } from '@/core/pxls-api/api-fetch.ts';
import { AuthResponse, StartAuthResponse } from '@/core/pxls-api/schemas/auth.ts';
import { InfoResponse } from '@/core/pxls-api/schemas/info.ts';
import { UsersResponse } from '@/core/pxls-api/schemas/users.ts';
import * as v from 'valibot';

const TIMEOUT_MS = 10000;
const TIMEOUT_MS_LONG = 20000;

function timeoutSignal(ms?: number): AbortSignal {
    return AbortSignal.timeout(ms ?? TIMEOUT_MS);
}

export const PxlsApi = {
    async fetchInfo(): Promise<ApiResponse<InfoResponse>> {
        return apiFetch('/info', InfoResponse, { signal: timeoutSignal() });
    },
    async fetchBoardData(): Promise<ApiResponse<ArrayBuffer>> {
        return binaryApiFetch('/boarddata', { signal: timeoutSignal(TIMEOUT_MS_LONG) });
    },
    async fetchHeatmapData(): Promise<ApiResponse<ArrayBuffer>> {
        return binaryApiFetch('/heatmap', { signal: timeoutSignal(TIMEOUT_MS_LONG) });
    },
    async fetchVirginmapData(): Promise<ApiResponse<ArrayBuffer>> {
        return binaryApiFetch('/virginmap', { signal: timeoutSignal(TIMEOUT_MS_LONG) });
    },
    async fetchPlacemapData(): Promise<ApiResponse<ArrayBuffer>> {
        return binaryApiFetch('/placemap', { signal: timeoutSignal(TIMEOUT_MS_LONG) });
    },
    async fetchInitialBoardData(): Promise<ApiResponse<ArrayBuffer>> {
        return binaryApiFetch('/initialboarddata', { signal: timeoutSignal(TIMEOUT_MS_LONG) });
    },
    async startAuthFlow(providerId: string): Promise<ApiResponse<StartAuthResponse>> {
        return apiFetch(`/signin/${providerId}`, StartAuthResponse, { signal: timeoutSignal(), method: 'POST' });
    },
    async finishAuthFlow(providerId: string, code: string, state: string): Promise<ApiResponse<AuthResponse>> {
        const searchParams = new URLSearchParams();
        searchParams.append('code', code);
        searchParams.append('state', state);
        searchParams.append('json', '1');
        return apiFetch(`/auth/${providerId}`, AuthResponse, { signal: timeoutSignal(), searchParams, method: 'POST' });
    },
    async signup(token: string, username: string, discordUsername?: string): Promise<ApiResponse<unknown>> {
        const formData = new FormData();
        formData.append('token', token);
        formData.append('username', username);
        if (discordUsername != null) {
            formData.append('discord', discordUsername);
        }
        return apiFetch('/signup', v.unknown(), { signal: timeoutSignal(), body: formData, method: 'POST' });
    },
    async logout(): Promise<ApiResponse<unknown>> {
        return apiFetch('/logout', v.unknown(), { signal: timeoutSignal(), method: 'POST' });
    },
    // TODO endpoints
    // async lookup(): Promise<void> {},
    // async report(): Promise<void> {},
    // async chatReport(): Promise<void> {},
    // async whoami(): Promise<void> {},
    async users(): Promise<ApiResponse<UsersResponse>> {
        return apiFetch('/users', UsersResponse, { signal: timeoutSignal() });
    },
    // async chatHistory(): Promise<void> {},
    // async setChatColor(): Promise<void> {},
    // async setDiscordName(): Promise<void> {},
    // async fetchProfileData(): Promise<void> {},
    // async searchFactions(): Promise<void> {},
    // async getFaction(): Promise<void> {},
    // async createFaction(): Promise<void> {},
    // async editFaction(): Promise<void> {},
    // async deleteFaction(): Promise<void> {},
};
