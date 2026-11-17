import { createServer } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

// Vite loads our shared TypeScript configuration at build time; no browser,
// framework migration, runtime server or new dependency is needed.
const vite = await createServer({ configFile: false, mode: 'production', server: { middlewareMode: true }, appType: 'custom' });
try {
  const { publicPages, aliasPaths, seoForPath } = await vite.ssrLoadModule('/src/seo/pages.ts');
  const { renderHead, escapeHtml } = await vite.ssrLoadModule('/src/seo/head.ts');
  const { absoluteUrl } = await vite.ssrLoadModule('/src/seo/config.ts');
  const template = await readFile('dist/index.html', 'utf8');
  if (!template.includes('<!-- BAAGH_SEO_HEAD -->')) throw new Error('SEO template marker missing');
  const html = page => template.replace('<!-- BAAGH_SEO_HEAD -->', renderHead(page));
  const { prerenderChaunsa } = await vite.ssrLoadModule('/src/seo/prerender.tsx');
  const chaunsa = prerenderChaunsa();
  const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
  const productCss = manifest['src/components/commercial/ProductDetail.tsx'].css ?? [];
  if (!productCss.length) throw new Error('Product stylesheet missing: no-JavaScript layout must be available before hydration');
  for (const page of publicPages) {
    const file = page.path === '/' ? 'dist/index.html' : `dist${page.path}/index.html`;
    await mkdir(file.slice(0, file.lastIndexOf('/')), { recursive: true });
    const document = html(page);
    await writeFile(file, page.path === '/product/mangoes/chaunsa'
      ? document.replace('</head>', `${productCss.map(file => `<link rel="stylesheet" href="/${file}">`).join('')}\n</head>`)
          .replace('<div id="root"></div>', `<div id="root">${chaunsa.body}</div><script id="baagh-prerender" type="application/json">${chaunsa.state}</script>`)
      : document);
  }
  for (const path of [...aliasPaths, '/basket']) {
    await mkdir(`dist${path}`, { recursive: true });
    await writeFile(`dist${path}/index.html`, html(seoForPath(path)));
  }
  await writeFile('dist/spa.html', html(seoForPath('/404')));
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages.map(page => `  <url><loc>${escapeHtml(absoluteUrl(page.path))}</loc></url>`).join('\n')}\n</urlset>\n`);
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`);
  await writeFile('dist/llms.txt', `# BAAGH\n\n> Fruit collection, gifting and educational Fruit Intelligence experiences.\n\nThis is a supplementary navigation resource. Refer to each page for current information. Prices marked provisional and catalogue states are not verified live inventory. Confirm order details with BAAGH.\n\n## Public pages\n${publicPages.map(page => `- [${page.label}](${absoluteUrl(page.path)}): ${page.description}`).join('\n')}\n`);
  await writeFile('dist/seo-manifest.json', JSON.stringify(publicPages.map(({ path, title, description, index, schema }) => ({ path, title, description, index, schemaTypes: schema.map(item => item['@type']) })), null, 2));
  console.log(`SEO: generated initial HTML metadata for ${publicPages.length} canonical pages, ${aliasPaths.length} aliases and basket; sitemap, robots.txt and llms.txt.`);
  console.log('Prerender: Chaunsa canonical product body only; all other routes retain the existing SPA bootstrap.');
} finally {
  await vite.close();
}
