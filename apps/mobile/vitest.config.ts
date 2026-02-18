import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'node',
        globals: false,
    },
    resolve: {
        alias: {
            '@iris/domain': path.resolve(__dirname, '../../packages/domain/src/index.ts'),
            '@': path.resolve(__dirname, './src'),
        },
    },
});
