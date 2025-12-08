import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import UnpluginInjectPreload from 'unplugin-inject-preload/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
    const isDev = command === 'serve';
    return {
        build: {
            target: 'esnext',
        },
        define: {
            __PXLS_API_BASE_URL__: isDev ? '"/pxls-api"' : '"https://pxls-proxy.shuni.moe"',
            __PXLS_SOCKET_BASE_URL__: isDev ? '"/pxls-ws"' : '"wss://pxls-proxy.shuni.moe"',
        },
        server: {
            proxy: {
                '/pxls-api': {
                    target: 'https://pxls-proxy.shuni.moe',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/pxls-api/, ''),
                    cookieDomainRewrite: {
                        '.pxls.space': 'localhost',
                        'pxls.space': 'localhost',
                    },
                },
                '/pxls-ws': {
                    target: 'https://pxls-proxy.shuni.moe',
                    ws: true,
                    changeOrigin: true,
                    rewriteWsOrigin: true,
                    rewrite: (path) => path.replace(/^\/pxls-ws/, ''),
                    cookieDomainRewrite: {
                        '.pxls.space': 'localhost',
                        'pxls.space': 'localhost',
                    },
                },
            },
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
    };
});
