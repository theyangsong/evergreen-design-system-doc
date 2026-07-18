import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';

const websiteRepoRoot = resolve(__dirname, '../../evergreen-design-system-website');
const tokensRoot = resolve(websiteRepoRoot, 'packages/tokens');
const tokensSpecDir = resolve(tokensRoot, 'spec');
const tokensLiquidGlassSource = resolve(tokensRoot, 'src/liquid-glass.js');
const tokensCornerSmoothingSource = resolve(tokensRoot, 'src/corner-smoothing.js');
const tokensBuildScript = resolve(tokensRoot, 'scripts/build.mjs');
const tokensDistCssDir = resolve(tokensRoot, 'dist/css');

function isTokensSourceFile(file: string) {
  return (
    file.startsWith(tokensSpecDir) ||
    file === tokensLiquidGlassSource ||
    file === tokensCornerSmoothingSource
  );
}

function isTokensDistCssFile(file: string) {
  return file.startsWith(tokensDistCssDir) && file.endsWith('.css');
}

function runTokensBuild(): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [tokensBuildScript], {
      cwd: tokensRoot,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      reject(new Error(`@evergreen/tokens build failed with exit code ${code ?? 'unknown'}`));
    });
  });
}

function reload(server: ViteDevServer) {
  server.ws.send({ type: 'full-reload', path: '*' });
}

export function evergreenTokensDevPlugin(): Plugin {
  let rebuildTimer: ReturnType<typeof setTimeout> | undefined;
  let rebuildInFlight: Promise<void> | null = null;
  let reloadTimer: ReturnType<typeof setTimeout> | undefined;
  let rebuilding = false;
  let startupSyncDone = false;

  const scheduleReload = (server: ViteDevServer) => {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      if (rebuilding) {
        return;
      }
      reload(server);
    }, 80);
  };

  const scheduleRebuild = (server: ViteDevServer, reason: string) => {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(async () => {
      if (rebuildInFlight) {
        await rebuildInFlight.catch(() => undefined);
        return;
      }

      server.config.logger.info(`rebuilding @evergreen/tokens (${reason})…`);
      rebuilding = true;

      rebuildInFlight = runTokensBuild()
        .then(() => {
          server.config.logger.info('tokens rebuilt, reloading page');
          scheduleReload(server);
        })
        .catch((error: unknown) => {
          server.config.logger.error(`tokens rebuild failed: ${String(error)}`);
        })
        .finally(() => {
          rebuilding = false;
          rebuildInFlight = null;
        });

      await rebuildInFlight;
    }, 250);
  };

  return {
    name: 'evergreen-tokens-dev',
    apply: 'serve',
    async configureServer(server) {
      server.watcher.add([
        tokensSpecDir,
        tokensLiquidGlassSource,
        tokensCornerSmoothingSource,
      ]);

      try {
        rebuilding = true;
        await runTokensBuild();
        server.config.logger.info('tokens synced on dev startup');
      } catch (error) {
        server.config.logger.warn(`tokens build on startup failed: ${String(error)}`);
      } finally {
        rebuilding = false;
        startupSyncDone = true;
      }

      server.watcher.add(tokensDistCssDir);

      server.middlewares.use((_req, res, next) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        next();
      });

      const onWatcherEvent = (file: string, event: 'change' | 'add') => {
        if (isTokensSourceFile(file)) {
          if (rebuilding || rebuildInFlight) {
            return;
          }

          scheduleRebuild(server, file.slice(tokensRoot.length + 1));
          return;
        }

        if (
          event === 'change' &&
          isTokensDistCssFile(file) &&
          startupSyncDone &&
          !rebuilding &&
          !rebuildInFlight
        ) {
          server.config.logger.info('tokens dist css changed, reloading page');
          scheduleReload(server);
        }
      };

      server.watcher.on('change', (file) => onWatcherEvent(file, 'change'));
      server.watcher.on('add', (file) => onWatcherEvent(file, 'add'));
    },
  };
}
