import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
const pages = JSON.parse(await readFile('dist/seo-manifest.json', 'utf8'));
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const robots = await readFile('dist/robots.txt', 'utf8');
const llms = await readFile('dist/llms.txt', 'utf8');
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const fruitInventories = {
  chaunsa: [8, 7],
  kinnow: [8, 9],
  apple: [9, 9],
  anaar: [10, 16],
};
const fruitPaths = Object.keys(fruitInventories).map(fruit => `/fruit-intelligence/${fruit}`);
const expectedPaths = ['/product/mangoes/chaunsa', '/everyday-fresh', '/signature', '/our-story', ...fruitPaths];
const titles = new Set();
const descriptions = new Set();
for (const page of pages) {
  const file = page.path === '/' ? 'dist/index.html' : `dist${page.path}/index.html`;
  const html = await readFile(file, 'utf8');
  if (expectedPaths.includes(page.path)) {
    const body = html.split('<div id="root">')[1]?.split('<script id="baagh-prerender"')[0];
    assert(body && (body.match(/<h1(?:\s|>)/g) ?? []).length === 1, `Expected one initial H1: ${page.path}`);
    assert(!body.includes('Preparing your experience'), `Suspense fallback in ${page.path}`);
    const bootstrap = JSON.parse(html.match(/id="baagh-prerender" type="application\/json">(.*?)<\/script>/s)[1]);
    assert.equal(bootstrap.version, 1);
    assert.equal(bootstrap.pathname, page.path);
    assert.equal(bootstrap.hash, '');
    if (fruitPaths.includes(page.path)) {
      const fruit = page.path.split('/').pop();
      const [acts, descriptions] = fruitInventories[fruit];
      assert.deepEqual(bootstrap.route, { view: 'fruit-intelligence', fruit });
      assert.equal((body.match(/class="fi-page"/g) ?? []).length, 1);
      assert.match(body, new RegExp(`data-fi-fruit="${fruit}" data-fi-client="false" data-fi-mode="reading"`));
      assert.equal((body.match(/<section class="fi-act"/g) ?? []).length, acts);
      assert.equal((body.match(/class="fi-characteristic" role="listitem"/g) ?? []).length, descriptions);
      assert.match(body, /class="fi-static-fruit" role="img" aria-label="[^"]+"/);
      assert.match(body, /href="\/everyday-fresh" class="fi-primary-cta"/);
      assert.match(body, /href="\/signature" class="fi-secondary-cta"/);
      assert.match(html, /<link rel="stylesheet" href="\/assets\/FruitIntelligence-[^"]+\.css">/);
    }
  }
  if (page.path === '/product/mangoes/chaunsa') {
    assert(html.includes('Graded by hand into one tier only.'));
    assert(html.includes('href="/fruit-intelligence/chaunsa"'));
    assert.equal((html.match(/class="product-primary-action"/g) ?? []).length, 1);
    assert.equal((html.match(/aria-label="Pack size"/g) ?? []).length, 1);
    assert(html.includes('assets/ProductDetail-') && html.includes('.css'));
  }
  assert(!titles.has(page.title), `Duplicate title: ${page.path}`);
  assert(!descriptions.has(page.description), `Duplicate description: ${page.path}`);
  titles.add(page.title); descriptions.add(page.description);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
  assert(sitemap.includes(`<loc>${canonical}</loc>`));
  assert(llms.includes(`](${canonical}): `));
  assert(html.includes('property="og:title"'));
  assert(html.includes('name="twitter:card"'));
  assert(!html.includes('BAAGH_SEO_HEAD'));
  const schema = JSON.parse(html.match(/type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema['@context'], 'https://schema.org');
  for (const node of schema['@graph']) {
    assert(node['@type']);
    if (node['@type'] === 'BreadcrumbList') node.itemListElement.forEach((item, index) => assert.equal(item.position, index + 1));
  }
  assert(!schema['@graph'].some(node => ['Product', 'Offer'].includes(node['@type'])), `Unexpected commercial schema: ${page.path}`);
  if (page.path.startsWith('/product/')) {
    for (const type of ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList']) assert(schema['@graph'].some(node => node['@type'] === type));
  }
  const rewrite = config.rewrites.find(rule => rule.source === page.path);
  assert(rewrite, `Missing Vercel rewrite: ${page.path}`);
  assert.equal(rewrite.destination, page.path === '/' ? '/index.html' : `${page.path}/index.html`);
}
assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length);
assert(!sitemap.includes('/basket'));
assert.match(robots, /User-agent: OAI-SearchBot\nAllow: \/\n/);
assert.match(robots, /User-agent: GPTBot\nDisallow: \/\n/);
assert(robots.includes('Sitemap: https://baagh.vercel.app/sitemap.xml'));
assert((await readFile('dist/spa.html', 'utf8')).includes('noindex, follow'));
console.log(`PASS: ${pages.length} canonical HTML heads, unique metadata, social tags, sitemap coverage, JSON-LD shape, truthful Product fields, Vercel mappings and crawler policies.`);

// Audit every generated document, including aliases and the SPA fallback.
const expectedBodies = expectedPaths.map(path => `${path.slice(1)}/index.html`).sort();
const actualBodies = [];
for (const file of await readdir('dist', { recursive: true })) {
  if (!file.endsWith('.html')) continue;
  const html = await readFile(`dist/${file}`, 'utf8');
  const name = file.replaceAll('\\', '/');
  const markers = (html.match(/id="baagh-prerender"/g) ?? []).length;
  if (markers) {
    assert.equal(markers, 1, `Duplicate prerender marker: ${name}`);
    actualBodies.push(name);
  }
  else assert(html.includes('<div id="root"></div>'), `Unexpected initial body: ${name}`);
}
assert.deepEqual(actualBodies.sort(), expectedBodies, 'Exactly eight canonical prerendered bodies required');
console.log('PASS: Exactly eight prerender markers and all four Fruit Intelligence inventories.');
