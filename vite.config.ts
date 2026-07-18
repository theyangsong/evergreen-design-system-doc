import vue from '@vitejs/plugin-vue';
import type { Connect } from 'vite';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { evergreenTokensDevPlugin } from './plugins/evergreen-tokens-dev';

const projectRoot = resolve(__dirname);
const websiteRepoRoot = resolve(projectRoot, '../evergreen-design-system-website');
const tokensRoot = resolve(websiteRepoRoot, 'packages/tokens');

function docsMediaNoCacheMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (req.url?.startsWith('/docs/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    next();
  };
}

function docsMediaNoCachePlugin() {
  return {
    name: 'docs-media-no-cache',
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(docsMediaNoCacheMiddleware());
    },
    configurePreviewServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(docsMediaNoCacheMiddleware());
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [
    vue(),
    ...(mode === 'development'
      ? [evergreenTokensDevPlugin(), docsMediaNoCachePlugin()]
      : []),
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
      '@blocksuite/icons/lit': resolve(projectRoot, 'src/shims/blocksuite-icons-lit.ts'),
      ...(mode === 'development'
        ? {
            '@evergreen/tokens/liquid-glass': resolve(tokensRoot, 'src/liquid-glass.js'),
            '@evergreen/tokens/corner-smoothing': resolve(tokensRoot, 'src/corner-smoothing.js'),
          }
        : {}),
    },
  },
  optimizeDeps: {
    exclude: ['@evergreen/tokens'],
    include: [
      '@blocksuite/presets',
      '@blocksuite/blocks',
      '@blocksuite/store',
    ],
    esbuildOptions: {
      alias: {
        '@blocksuite/icons/lit': resolve(projectRoot, 'src/shims/blocksuite-icons-lit.ts'),
      },
    },
  },
  build: {
    target: 'es2022',
  },
  css: {
    devSourcemap: true,
    modules: {
      generateScopedName:
        mode === 'production' ? '[name]__[local]___[hash:base64:5]' : '[name]__[local]',
    },
  },
  server: {
    port: 5176,
    strictPort: true,
    fs: {
      allow: [projectRoot, websiteRepoRoot],
    },
    watch: {
      ignored: ['**/.git/**', '**/node_modules/**'],
    },
  },
}));
