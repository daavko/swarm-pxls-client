import type { PaletteItem } from '@/core/pxls-api/schemas/info.ts';

export interface TemplateProcessingMessage<TaskType extends string, PayloadType> {
    id: string;
    type: TaskType;
    payload: PayloadType;
}

export interface TemplateGeneralErrorResponse {
    success: false;
    error: Error;
}

export interface TemplateColorMapRequest {
    image: ImageData;
    palette: PaletteItem[];
}

export interface TemplateColorMapSuccessResponse {
    success: true;
    image: ImageData;
}

export type TemplateColorMapResponse = TemplateColorMapSuccessResponse | TemplateGeneralErrorResponse;

export interface TemplateDetemplatizeRequest {
    image: ImageData;
}

export interface TemplateDetemplatizeSuccessResponse {
    success: true;
    image: ImageData;
}

export type TemplateDetemplatizeResponse = TemplateDetemplatizeSuccessResponse | TemplateGeneralErrorResponse;

interface RequestResponsePair<RequestType, ResponseType> {
    request: RequestType;
    response: ResponseType;
}

export type TemplateProcessingMessageMap = {
    colorMap: RequestResponsePair<TemplateColorMapRequest, TemplateColorMapResponse>;
    detemplatize: RequestResponsePair<TemplateDetemplatizeRequest, TemplateDetemplatizeResponse>;
};

export type TemplateProcessingRequest<TaskKey extends keyof TemplateProcessingMessageMap> =
    TemplateProcessingMessageMap[TaskKey]['request'];
export type TemplateProcessingRequestMessage<TaskKey extends keyof TemplateProcessingMessageMap> =
    TemplateProcessingMessage<TaskKey, TemplateProcessingMessageMap[TaskKey]['request']>;
export type TemplateProcessingResponse<TaskKey extends keyof TemplateProcessingMessageMap> =
    TemplateProcessingMessageMap[TaskKey]['response'];
export type TemplateProcessingResponseMessage<TaskKey extends keyof TemplateProcessingMessageMap> =
    TemplateProcessingMessage<TaskKey, TemplateProcessingMessageMap[TaskKey]['response']>;
