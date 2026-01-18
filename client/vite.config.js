import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const isProduction = mode === 'production';

    return {
        plugins: [react()],
        server: {
            port: 5173,
            proxy: {
                '/api': {
                    target: env.VITE_API_URL || 'http://localhost:3001',
                    changeOrigin: true,
                    secure: false
                }
            }
        },
        build: {
            outDir: 'dist',
            sourcemap: !isProduction,
            minify: isProduction ? 'esbuild' : false
        },
        define: {
            'import.meta.env.VITE_APP_NAME': JSON.stringify('Kevlify Authenticator')
        }
    };
});
