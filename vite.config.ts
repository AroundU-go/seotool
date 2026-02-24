import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/api/vebapi': {
          target: 'https://vebapi.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/vebapi/, '/api'),
          headers: {
            'X-API-KEY': env.VITE_VEBAPI_KEY || '',
          },
        },
      },
    },
  };
});
