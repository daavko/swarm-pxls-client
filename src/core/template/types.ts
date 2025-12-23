import * as v from 'valibot';

type TemplateLoadState = 'beforeLoad' | 'loading' | 'loaded' | 'error' | 'checkingForUpdate' | 'updateCheckError';

interface BaseCanvasTemplate {
    name: string;
    loadState: TemplateLoadState;
    enabled: boolean;
}

interface RedirectCanvasTemplate extends BaseCanvasTemplate {
    type: 'redirect';
    link: string;
    data?: RedirectTemplateData;
}

interface LinkCanvasTemplate extends BaseCanvasTemplate {
    type: 'link';
    link: string;
    data?: LinkTemplateData;
}

interface ImageCanvasTemplate extends BaseCanvasTemplate {
    type: 'image';
    imageUrl: string;
    x: number;
    y: number;
    width: number;
    data?: ImageTemplateData;
}

export type CanvasTemplate = RedirectCanvasTemplate | LinkCanvasTemplate | ImageCanvasTemplate;

interface BaseTemplateData {
    imageData: ImageData;
    x: number;
    y: number;
}

interface RedirectTemplateData extends BaseTemplateData {
    resultingTemplateLink: string;
}

type LinkTemplateData = BaseTemplateData;

type ImageTemplateData = BaseTemplateData;

export const TemplateRenderingMode = v.picklist(['oneToOne', 'dotted', 'symbols', 'numbers']);
export type TemplateRenderingMode = v.InferOutput<typeof TemplateRenderingMode>;
