import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 为 storybook 服务
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      lodash: 'lodash-es',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
});
