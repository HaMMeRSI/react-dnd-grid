// eslint-disable-next-line
// @ts-nocheck
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { extname, relative, resolve } from 'path';
import VitePluginHtmlEnv from 'vite-plugin-html-env';
import dns from 'dns';
import dts from 'vite-plugin-dts';
import { glob } from 'glob';
import { fileURLToPath } from 'node:url';

const nodeEnv = process.env.NODE_ENV;

// https://vitejs.dev/config/
export default () => {
    if (nodeEnv === 'development') {
        dns.setDefaultResultOrder('verbatim');
    }

    return defineConfig({
        server: { port: 3000 },
        build: {
            copyPublicDir: false,
            lib: {
                entry: resolve(__dirname, 'lib/main.ts'),
                formats: ['es'],
            },
            rollupOptions: {
                external: ['react', 'react/jsx-runtime'],
                input: Object.fromEntries(
                    // https://rollupjs.org/configuration-options/#input
                    glob.sync('lib/**/*.{ts,tsx}').map(file => [
                        // 1. The name of the entry point
                        // lib/nested/foo.js becomes nested/foo
                        relative('lib', file.slice(0, file.length - extname(file).length)),
                        // 2. The absolute path to the entry file
                        // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
                        fileURLToPath(new URL(file, import.meta.url)),
                    ])
                ),
                output: {
                    assetFileNames: 'assets/[name][extname]',
                    entryFileNames: '[name].js',
                },
            },
        },
        plugins: [
            VitePluginHtmlEnv({
                compiler: false,
            }),
            react({
                babel: {
                    plugins: [
                        [
                            '@emotion/babel-plugin',
                            {
                                sourceMap: false,
                                autoLabel: 'dev-only',
                                labelFormat: '[local]',
                                cssPropOptimization: true,
                            },
                        ],
                    ],
                },
            }),
            dts({ include: ['lib'] }),
        ],
        resolve: { alias: { '@': resolve(__dirname, './src'), $: resolve(__dirname, './lib') } },
    });
};
