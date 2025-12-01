import type { Dialog } from '@/core/dialog/types.ts';
import type { InjectionKey } from 'vue';

export const CURRENT_DIALOG = Symbol() as InjectionKey<Dialog>;
