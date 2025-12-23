import { type CanvasTemplate, TemplateRenderingMode } from '@/core/template/types.ts';
import { typedStorageSerializer } from '@/utils/typed-storage-serializer.ts';
import { type RemovableRef, useLocalStorage } from '@vueuse/core';
import * as v from 'valibot';

const baseStoredTemplateSchema = v.object({
    name: v.string(),
    enabled: v.boolean(),
});

const redirectStoredTemplateSchema = v.object({
    ...baseStoredTemplateSchema.entries,
    type: v.literal('redirect'),
    link: v.string(),
});

const linkStoredTemplateSchema = v.object({
    ...baseStoredTemplateSchema.entries,
    type: v.literal('link'),
    link: v.string(),
});

const imageStoredTemplateSchema = v.object({
    ...baseStoredTemplateSchema.entries,
    type: v.literal('image'),
    imageUrl: v.string(),
    x: v.number(),
    y: v.number(),
    width: v.number(),
});

const storedTemplateSchema = v.pipe(
    v.variant('type', [redirectStoredTemplateSchema, linkStoredTemplateSchema, imageStoredTemplateSchema]),
    v.transform((data): CanvasTemplate => {
        return { loadState: 'beforeLoad', ...data };
    }),
);

const templateStorageSchema = v.object({
    renderingMode: TemplateRenderingMode,
    dotSize: v.number(),
    templates: v.array(storedTemplateSchema),
});

export interface TemplateStorage {
    renderingMode: TemplateRenderingMode;
    dotSize: number;
    templates: CanvasTemplate[];
}

export function useTemplateStorage(): RemovableRef<TemplateStorage> {
    return useLocalStorage<TemplateStorage>(
        'templates',
        {
            renderingMode: 'dotted',
            dotSize: 0.5,
            templates: [],
        },
        {
            serializer: typedStorageSerializer(templateStorageSchema),
            flush: 'sync',
        },
    );
}
