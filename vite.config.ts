// eslint-disable-next-line
// @ts-nocheck
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import VitePluginHtmlEnv from 'vite-plugin-html-env';
import dns from 'dns';

const nodeEnv = process.env.NODE_ENV;

// https://vitejs.dev/config/
export default () => {
    if (nodeEnv === 'development') {
        dns.setDefaultResultOrder('verbatim');
    }

    return defineConfig({
        server: { port: 3000 },
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
        ],
        resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    });
};
