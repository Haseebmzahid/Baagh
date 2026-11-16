import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vercel from './vercel.json';

export default defineConfig({
  plugins: [react(), {
    name: 'preview-vercel-routing',
    configurePreviewServer(server) {
      // Vite's SPA preview otherwise serves the homepage head for clean deep
      // URLs. Exercise the same explicit HTML mappings used in production.
      server.middlewares.use((request, _response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        const path = url.pathname.replace(/\/+$/, '') || '/';
        const rule = vercel.rewrites.find(rewrite => rewrite.source === path)
          ?? vercel.rewrites.find(rewrite => rewrite.source.startsWith('/((') && new RegExp(`^${rewrite.source}$`).test(path));
        if (rule) request.url = `${rule.destination}${url.search}`;
        next();
      });
    },
  }],
  server: {
    port: 3000,
    host: true
  }
});
