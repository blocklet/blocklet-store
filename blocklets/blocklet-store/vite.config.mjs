import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createBlockletPlugin } from 'vite-plugin-blocklet';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';
import { version } from './package.json';

const isAnalyze = process.env.ANALYZE_BUILD === 'true';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const alias = {
    lodash: 'lodash-es',
  };

  if (isProduction) {
    // mui-datatable
    alias['lodash.assign'] = 'lodash/assign';
    alias['lodash.clonedeep'] = 'lodash/cloneDeep';
    alias['lodash.isequal'] = 'lodash/isEqual';
    alias['lodash.merge'] = 'lodash/merge';
    alias['lodash.find'] = 'lodash/find';
  }

  return {
    define: {
      // HACK: 必须使用 JSON.string 来处理一下
      // @see https://cn.vitejs.dev/config/shared-options.html#define
      __VERSION__: JSON.stringify(version),
    },
    resolve: {
      alias,
      dedupe: [
        //
        '@blocklet/ui-react',
        '@arcblock/ux',
        '@arcblock/did-connect-react',
        '@mui/material',
        // '@mui/utils',
        '@mui/icons-material',
        'react',
        'react-dom',
        'lodash',
        'bn.js',
      ],
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          {
            name: 'ignore-node-crypto',
            setup(build) {
              build.onResolve({ filter: /^crypto$/ }, () => ({ external: true }));
            },
          },
        ],
      },
    },
    build: {
      modulePreload: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'lottie-vendor': ['lottie-web', 'lottie-react'],
            'utils-vendor': [
              'lodash-es',
              'lodash.merge',
              'lodash.find',
              'lodash.isequal',
              'lodash.clonedeep',
              'lodash.assignwith',
              'ahooks',
            ],
            'sentry-vendor': ['@sentry/core', '@sentry/tracing', '@sentry/react', '@sentry/utils'],
            'ui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled', '@iconify-icon/react'],
            'rehype-prism-plus-vendor': ['rehype-prism-plus'],
            'arcblock-did-vendor': ['@arcblock/did'],
            'arcblock-did-connect-vendor': ['@arcblock/did-connect-react'],
            'arcblock-did-util-vendor': ['@arcblock/did-util'],
            'monaco-editor-vendor': ['monaco-editor'],
            'arcblock-ux-vendor': ['@arcblock/ux'],
            'blocklet-editor-vendor': ['@blocklet/editor'],
            'discuss-kit-highlight-vendor': ['highlight.js'],
            'discuss-kit-refractor-vendor': ['refractor'],
            'discuss-kit-vendor': ['@blocklet/discuss-kit'],
          },
        },
      },
    },
    plugins: [
      {
        name: 'custom-plugin',
        apply: 'serve',
        transformIndexHtml(html) {
          if (process.env.SKIP_DEFAULTPROPS_ERROR === 'true') {
            return html.replace(
              '</head>',
              `<script>
                  console.warn('已屏蔽关于 React defaultProps 的警告！');
                  const originalError = console.error;
                  console.error = (...args) => {
                    if (typeof args[0] === 'string' && args[0].includes('Support for defaultProps')) {
                      return;
                    }
                    originalError(...args);
                  };
              </script>
              </head>`
            );
          }
          return html;
        },
      },
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
      svgr(),
      createBlockletPlugin({
        loadingColor: '#1DC1C7',
        loadingImage: `/.well-known/service/blocklet/logo?imageFilter=convert&f=png&w=160&v=${version}`,
        disableDynamicAssetHost: false,
        chunkSizeLimit: 4096,
      }),
      ...(isAnalyze
        ? [
            visualizer({
              open: true,
              filename: 'dist/stats.html',
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : []),
    ],
  };
});
