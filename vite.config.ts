import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import vercel from './vercel.json';

export default defineConfig(({ isPreview }) => ({
  appType: isPreview ? 'custom' : 'spa',
  build: { manifest: true },
  plugins: [react(), {
    name: 'preview-vercel-routing',
    async configurePreviewServer(server) {
      const errorPage = await readFile(resolve(server.config.root, server.config.build.outDir, '404.html'));
      const mappings = vercel.rewrites.map(rule => ({
        ...rule,
        pattern: rule.source.includes('[') ? new RegExp(`^${rule.source}$`) : undefined,
      }));
      server.middlewares.use((request, response, next) => {
        const url = new URL(`http://localhost${request.url ?? '/'}`);
        const path = url.pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
        if (path !== url.pathname) {
          response.writeHead(308, { Location: `${path}${url.search}` });
          response.end();
          return;
        }
        const rule = mappings.find(rewrite => rewrite.source === path || rewrite.pattern?.test(path));
        if (rule) request.url = `${rule.destination}${url.search}`;
        next();
      });
      // Run after Vite's static-file handler so only unresolved requests reach this response.
      return () => {
        server.middlewares.use((request, response) => {
          response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': errorPage.length });
          response.end(request.method === 'HEAD' ? undefined : errorPage);
        });
      };
    },
  }],
  server: {
    port: 3000,
    host: true
  }
}));
