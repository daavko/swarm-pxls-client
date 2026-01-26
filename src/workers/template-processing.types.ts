import type { PaletteItem } from '@/core/pxls-api/schemas/info.ts';

export interface TemplateProcessingTask<TaskType extends string, PayloadType> {
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

export type TemplateProcessingTaskRequest =
    | TemplateProcessingTask<'colorMap', TemplateColorMapRequest>
    | TemplateProcessingTask<'detemplatize', TemplateDetemplatizeRequest>;
export type TemplateProcessingTaskResponse =
    | TemplateProcessingTask<'colorMap', TemplateColorMapResponse>
    | TemplateProcessingTask<'detemplatize', TemplateDetemplatizeResponse>;
