import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';
import { globalIgnores } from 'eslint/config';

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
    {
        name: 'app/files-to-lint',
        files: ['**/*.{ts,mts,tsx,vue}'],
    },

    globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

    pluginVue.configs['flat/essential'],
    vueTsConfigs.recommendedTypeChecked,
    skipFormatting,
    comments.recommended,
    {
        files: ['**/*.{ts,mts,tsx,vue}'],
        rules: {
            '@eslint-community/eslint-comments/no-use': [
                'error',
                { allow: ['eslint-disable-line', 'eslint-disable-next-line'] },
            ],
            '@eslint-community/eslint-comments/require-description': 'error',

            '@typescript-eslint/default-param-last': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/explicit-member-accessibility': ['warn', { accessibility: 'no-public' }],
            '@typescript-eslint/explicit-module-boundary-types': 'error',
            '@typescript-eslint/member-ordering': 'warn',
            '@typescript-eslint/no-import-type-side-effects': 'error',
            '@typescript-eslint/no-invalid-void-type': 'off', // this rule is partially broken so not very useful, see https://github.com/typescript-eslint/typescript-eslint/issues/8113
            '@typescript-eslint/no-shadow': 'warn',
            '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
            '@typescript-eslint/no-unsafe-type-assertion': 'warn',
            '@typescript-eslint/prefer-enum-initializers': 'error',
            '@typescript-eslint/prefer-readonly': 'warn',
            '@typescript-eslint/promise-function-async': 'error',
            '@typescript-eslint/require-array-sort-compare': 'error',
            '@typescript-eslint/restrict-template-expressions': ['error', { allowBoolean: true, allowNumber: true }],
            '@typescript-eslint/strict-boolean-expressions': ['error', { allowNumber: false, allowString: false }],
        },
    },
);
