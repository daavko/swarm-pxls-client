import type { CanvasTemplate, TemplateRenderingMode } from '@/core/template/types.ts';
import { useTemplateStorage } from '@/core/template/use-template-storage.ts';
import { defineStore } from 'pinia';
import { ref, shallowRef, watch } from 'vue';

export const useTemplateStore = defineStore('templates', () => {
    const templateStorage = useTemplateStorage();

    const renderingMode = ref<TemplateRenderingMode>(templateStorage.value.renderingMode);
    const dotSize = ref<number>(templateStorage.value.dotSize);
    const templates = ref<CanvasTemplate[]>(templateStorage.value.templates);
    const displayData = shallowRef<ImageData | null>(null);

    watch(templates, () => {});

    function addTemplate(template: CanvasTemplate): void {}

    function loadTemplateData(templateName: string): void {
        const template = templates.value.find((t) => t.name === templateName);
        if (!template || template.loadState === 'loading' || template.loadState === 'checkingForUpdate') {
            return;
        }

        template.loadState = 'loading';
    }

    return {
        renderingMode,
        dotSize,
        templates,
        addTemplate,
    };
});
