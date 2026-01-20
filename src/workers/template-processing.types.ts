export interface TemplateGeneralErrorResponse {
    success: false;
    error: Error;
}

export interface TemplateColorMapRequest {
    requestType: 'colorMap';
    image: ImageData;
}

export interface TemplateColorMapSuccessResponse {
    success: true;
    image: ImageData;
}

export type TemplateColorMapResponse = TemplateColorMapSuccessResponse | TemplateGeneralErrorResponse;

export interface TemplateDetemplatizeRequest {
    requestType: 'detemplatize';
    image: ImageData;
}

export interface TemplateDetemplatizeSuccessResponse {
    success: true;
    image: ImageData;
}

export type TemplateDetemplatizeResponse = TemplateDetemplatizeSuccessResponse | TemplateGeneralErrorResponse;
