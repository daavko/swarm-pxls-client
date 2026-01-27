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

export interface ColorMapRequest {
    image: ImageData;
    palette: PaletteItem[];
}

export interface ColorMapSuccessResponse {
    success: true;
    image: ImageData;
}

export type ColorMapResponse = ColorMapSuccessResponse | TemplateGeneralErrorResponse;

export interface HighlightIncorrectColorsRequest {
    image: ImageData;
    palette: PaletteItem[];
}

export interface HighlightIncorrectColorsSuccessResponse {
    success: true;
    image: ImageData;
}

export type HighlightIncorrectColorsResponse = HighlightIncorrectColorsSuccessResponse | TemplateGeneralErrorResponse;

export interface DetemplatizeRequest {
    image: ImageData;
    targetWidth: number;
}

export interface DetemplatizeSuccessResponse {
    success: true;
    image: ImageData;
}

export type DetemplatizeResponse = DetemplatizeSuccessResponse | TemplateGeneralErrorResponse;

interface RequestResponsePair<RequestType, ResponseType> {
    request: RequestType;
    response: ResponseType;
}

export type TemplateProcessingMessageMap = {
    colorMap: RequestResponsePair<ColorMapRequest, ColorMapResponse>;
    highlightIncorrectColors: RequestResponsePair<HighlightIncorrectColorsRequest, HighlightIncorrectColorsResponse>;
    detemplatize: RequestResponsePair<DetemplatizeRequest, DetemplatizeResponse>;
};

export type TemplateProcessingRequest<TaskKey extends keyof TemplateProcessingMessageMap> =
    TemplateProcessingMessageMap[TaskKey]['request'];
export type TemplateProcessingResponse<TaskKey extends keyof TemplateProcessingMessageMap> =
    TemplateProcessingMessageMap[TaskKey]['response'];

export type TemplateProcessingKeyedRequestMessage<TaskKey extends keyof TemplateProcessingMessageMap> =
    TemplateProcessingMessage<TaskKey, TemplateProcessingMessageMap[TaskKey]['request']>;
export type TemplateProcessingKeyedResponseMessage<TaskKey extends keyof TemplateProcessingMessageMap> =
    TemplateProcessingMessage<TaskKey, TemplateProcessingMessageMap[TaskKey]['response']>;

export type TemplateProcessingRequestMessage = {
    [K in keyof TemplateProcessingMessageMap]: TemplateProcessingKeyedRequestMessage<K>;
}[keyof TemplateProcessingMessageMap];

export type TemplateProcessingResponseMessage = {
    [K in keyof TemplateProcessingMessageMap]: TemplateProcessingKeyedResponseMessage<K>;
}[keyof TemplateProcessingMessageMap];
