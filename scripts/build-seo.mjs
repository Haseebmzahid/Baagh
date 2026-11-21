import { createServer } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

// Vite loads our shared TypeScript configuration at build time; no browser,
// framework migration, runtime server or new dependency is needed.
const vite = await createServer({ configFile: false, mode: 'production', server: { middlewareMode: true }, appType: 'custom' });
try {
  const { publicPages, aliasPaths, seoForPath } = await vite.ssrLoadModule('/src/seo/pages.ts');
  const { renderHead, escapeHtml } = await vite.ssrLoadModule('/src/seo/head.ts');
  const { absoluteUrl } = await vite.ssrLoadModule('/src/seo/config.ts');
  const { commercial } = await vite.ssrLoadModule('/src/components/commercial/theme.ts');
  const template = await readFile('dist/index.html', 'utf8');
  if (!template.includes('<!-- BAAGH_SEO_HEAD -->')) throw new Error('SEO template marker missing');
  const html = page => template.replace('<!-- BAAGH_SEO_HEAD -->', renderHead(page));
  const { prerenderPage } = await vite.ssrLoadModule('/src/seo/prerender.tsx');
  const { prerenderPaths } = await vite.ssrLoadModule('/src/seo/bootstrap.ts');
  const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
  function collectCss(entry, visited = new Set()) {
    if (visited.has(entry)) return [];
    visited.add(entry);
    const { imports = [], css = [] } = manifest[entry];
    return [...imports.flatMap(dependency => collectCss(dependency, visited)), ...css];
  }
  const routeStyles = {
    product: 'src/components/commercial/ProductDetail.tsx',
    // Rollup can emit this shared dynamic facade under a generated manifest key.
    'fruit-intelligence': Object.keys(manifest).find(key =>
      manifest[key].isDynamicEntry && manifest[key].name === 'FruitIntelligence'),
  };
  for (const entry of Object.values(routeStyles)) {
    if (!manifest[entry]?.css?.length) throw new Error(`Missing prerender stylesheet: ${entry}`);
  }
  for (const page of publicPages) {
    const file = page.path === '/' ? 'dist/index.html' : `dist${page.path}/index.html`;
    await mkdir(file.slice(0, file.lastIndexOf('/')), { recursive: true });
    const document = html(page);
    const rendered = prerenderPaths.includes(page.path) ? await prerenderPage(page.path) : undefined;
    const stylesheetEntry = rendered && routeStyles[JSON.parse(rendered.state).route.view];
    const styles = stylesheetEntry ? [...new Set(collectCss(stylesheetEntry))]
      .filter(file => !template.includes(`href="/${file}"`)) : [];
    await writeFile(file, rendered
      ? document.replace('</head>', `${styles.map(file => `<link rel="stylesheet" href="/${file}">`).join('')}\n</head>`)
          .replace('<div id="root"></div>', `<div id="root">${rendered.body}</div><script id="baagh-prerender" type="application/json">${rendered.state}</script>`)
      : document);

  }
  for (const path of [...aliasPaths, '/basket']) {
    await mkdir(`dist${path}`, { recursive: true });
    await writeFile(`dist${path}/index.html`, html(seoForPath(path)));
  }
  const { color, font, type } = commercial;
  await writeFile('dist/404.html', `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page not found | BAAGH</title>
  <meta name="robots" content="noindex, follow">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,200..400&amp;family=IBM+Plex+Mono&amp;display=swap">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; color: ${color.ink}; background: ${color.canvas}; font-family: ${font.serif}; }
    main { max-width: 68rem; margin: auto; padding: clamp(2rem, 12vh, 8rem) clamp(1.25rem, 5vw, 4rem); }
    .brand, .label { font: .8rem/1.5 ${font.mono}; letter-spacing: .12em; text-transform: uppercase; }
    .brand { display: inline-flex; align-items: center; min-height: 44px; color: inherit; }
    .label { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid ${color.hair22}; color: ${color.gold}; }
    h1 { font-size: ${type.d1.size}; font-weight: ${type.d1.weight}; line-height: ${type.d1.lineHeight}; margin: 1rem 0; }
    .lead { font-size: ${type.b1.size}; line-height: ${type.b1.lineHeight}; color: ${color.ink84}; }
    nav { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.75rem; }
    nav a { display: inline-flex; align-items: center; min-height: 44px; padding: .5rem 1rem; color: inherit; border: 1px solid ${color.hair22}; border-radius: 2px; }
    nav a:first-child { background: ${color.gold}; color: ${color.deep}; }
    a:focus-visible { outline: 2px solid ${color.gold}; outline-offset: 4px; }
  </style>
</head>
<body>
  <main>
    <a class="brand" href="/" aria-label="BAAGH home">BAAGH</a>
    <p class="label">Page not found · 404</p>
    <h1>Let’s find your fruit.</h1>
    <p class="lead">This page isn’t available. You can continue shopping or return to the homepage.</p>
    <nav aria-label="Return to BAAGH">
      <a href="/everyday-fresh">Shop Everyday Fresh</a>
      <a href="/">Back to homepage</a>
    </nav>
  </main>
</body>
</html>
`);
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages.map(page => `  <url><loc>${escapeHtml(absoluteUrl(page.path))}</loc></url>`).join('\n')}\n</urlset>\n`);
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`);
  await writeFile('dist/llms.txt', `# BAAGH\n\n> Fruit collection, gifting and educational Fruit Intelligence experiences.\n\nThis is a supplementary navigation resource. Refer to each page for current information. Prices marked provisional and catalogue states are not verified live inventory. Confirm order details with BAAGH.\n\n## Public pages\n${publicPages.map(page => `- [${page.label}](${absoluteUrl(page.path)}): ${page.description}`).join('\n')}\n`);
  await writeFile('dist/seo-manifest.json', JSON.stringify(publicPages.map(({ path, title, description, index, schema }) => ({ path, title, description, index, schemaTypes: schema.map(item => item['@type']) })), null, 2));
  console.log(`SEO: generated initial HTML metadata for ${publicPages.length} canonical pages, ${aliasPaths.length} aliases and basket; sitemap, robots.txt and llms.txt.`);
  console.log(`Prerender: ${prerenderPaths.join(', ')}`);
} finally {
  await vite.close();
}
