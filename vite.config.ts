import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import UnpluginInjectPreload from 'unplugin-inject-preload/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    build: {
        target: 'esnext',
    },
    plugins: [
        vue(),
        // vueDevTools(),
        UnpluginInjectPreload({
            files: [
                {
                    entryMatch: /inter-latin.+\.woff2/,
                },
            ],
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
