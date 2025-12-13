import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3114,
        host: '0.0.0.0',
        allowedHosts: [
          'trace.matrixlab.work',
          'localhost',
          '.matrixlab.work', // 允许所有 matrixlab.work 子域名
        ],
        proxy: {
          ...(env.SOLANA_PROXY_TARGET ? {
            '/api/solana': {
              target: env.SOLANA_PROXY_TARGET,
              changeOrigin: true,
              secure: false,
            }
          } : {}),
          ...(env.ETH_PROXY_TARGET ? {
            '/api/eth': {
              target: env.ETH_PROXY_TARGET,
              changeOrigin: true,
              secure: false,
            }
          } : {})
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
