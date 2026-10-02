import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

/**
 * data/ (settings JSON, CSV tables, theme and data/media/ images) lives in the project root (one level up) and are plain files
 * that can be edited without rebuilding. In dev they are served from there; in a build
 * they are already next to the generated index.html, so nothing is copied.
 */
const root = path.resolve(import.meta.dirname, '..');
const TYPES = { '.json': 'application/json', '.csv': 'text/csv; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
const serveStatic = () => ({
  name: 'serve-project-files',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = decodeURIComponent((req.url || '').split('?')[0]);
      if (!/^\/data\//.test(url)) return next();
      const file = path.join(root, url);
      if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return next();
      res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
      fs.createReadStream(file).pipe(res);
    });
  },
});

export default defineConfig({
  base: './',
  plugins: [react(), serveStatic()],
  publicDir: false,
  build: {
    outDir: '..', emptyOutDir: false, assetsDir: 'assets', sourcemap: false,
    // Fixed file names (no hash), so every build writes the same names and index.html never changes between builds.
    // Trade-off: browsers may keep an old copy for a few minutes after you publish (GitHub Pages caches ~10 min).
    rollupOptions: { output: { entryFileNames: 'assets/app.js', chunkFileNames: 'assets/[name].js', assetFileNames: 'assets/[name][extname]' } },
  },
  server: { port: 5173 },
});
