import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    root: '.',
    base: './',
    build: {
        outDir: 'dist/renderer',
        emptyOutDir: true
    },
    server: {
        port: 5173
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src/renderer'),
            '@iris/domain': path.resolve(__dirname, '../../packages/domain/src')
        }
    }
});
