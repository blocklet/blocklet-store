import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'unplugin-dts/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      bundleTypes: true,
      tsconfigPath: './tsconfig.json',
      outDir: 'lib',
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      lodash: 'lodash-es',
    },
    dedupe: [
      //
      '@blocklet/ui-react',
      '@arcblock/ux',
      '@arcblock/did-connect',
      '@mui/material',
      // '@mui/utils',
      '@mui/icons-material',
      'react',
      'react-dom',
      'lodash',
      'bn.js',
    ],
  },
  build: {
    outDir: 'lib',
    emptyOutDir: false,
    lib: {
      entry: ['src/index.tsx'],
      formats: ['es'],
      fileName: () => 'index.es.js',
    },
    rollupOptions: {
      external: (id) => {
        return !(id.startsWith('./') || id.startsWith('/') || id.startsWith('../'));
      },
    },
  },
});
