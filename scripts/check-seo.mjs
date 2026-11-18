import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
const pages = JSON.parse(await readFile('dist/seo-manifest.json', 'utf8'));
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const robots = await readFile('dist/robots.txt', 'utf8');
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const titles = new Set();
const descriptions = new Set();
for (const page of pages) {
  const file = page.path === '/' ? 'dist/index.html' : `dist${page.path}/index.html`;
  const html = await readFile(file, 'utf8');
  if (page.path === '/product/mangoes/chaunsa') {
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
    assert(html.includes('Graded by hand into one tier only.'));
    assert(html.includes('href="/fruit-intelligence/chaunsa"'));
    assert.equal((html.match(/class="product-primary-action"/g) ?? []).length, 1);
    assert.equal((html.match(/aria-label="Pack size"/g) ?? []).length, 1);
    const bootstrap = JSON.parse(html.match(/id="baagh-prerender" type="application\/json">(.*?)<\/script>/s)[1]);
    assert.equal(bootstrap.pathname, page.path);
    assert(html.includes('assets/ProductDetail-') && html.includes('.css'));
  } else if (['/everyday-fresh', '/signature', '/our-story'].includes(page.path)) {
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
    const bootstrap = JSON.parse(html.match(/id="baagh-prerender" type="application\/json">(.*?)<\/script>/s)[1]);
    assert.equal(bootstrap.pathname, page.path);
    assert(!html.includes('Preparing your experience'));
  } else {
    assert(html.includes('<div id="root"></div>'));
    assert(!html.includes('id="baagh-prerender"'), `Unexpected prerender rollout: ${page.path}`);
  }
  assert(!titles.has(page.title), `Duplicate title: ${page.path}`);
  assert(!descriptions.has(page.description), `Duplicate description: ${page.path}`);
  titles.add(page.title); descriptions.add(page.description);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
  assert(sitemap.includes(`<loc>${canonical}</loc>`));
  assert(html.includes('property="og:title"'));
  assert(html.includes('name="twitter:card"'));
  assert(!html.includes('BAAGH_SEO_HEAD'));
  const schema = JSON.parse(html.match(/type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema['@context'], 'https://schema.org');
  for (const node of schema['@graph']) {
    assert(node['@type']);
    if (node['@type'] === 'Product') {
      assert(node.name && node.description && node.url);
      assert(node.offers?.length || node.review?.length, 'Incomplete Product entity');
    }
    if (node['@type'] === 'BreadcrumbList') node.itemListElement.forEach((item, index) => assert.equal(item.position, index + 1));
  }
  if (page.path.startsWith('/product/')) {
    assert.equal(schema['@graph'].filter(node => node['@type'] === 'Product').length, 0, 'Current provisional catalogue must withhold Product');
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
assert((await readFile('dist/spa.html', 'utf8')).includes('noindex, follow'));
console.log(`PASS: ${pages.length} canonical HTML heads, unique metadata, social tags, sitemap coverage, JSON-LD shape, truthful Product fields, Vercel mappings and crawler policies.`);

// Audit every generated document, including aliases and the SPA fallback.
const expectedBodies = ['everyday-fresh/index.html', 'signature/index.html', 'our-story/index.html', 'product/mangoes/chaunsa/index.html'].sort();
const actualBodies = [];
for (const file of await readdir('dist', { recursive: true })) {
  if (!file.endsWith('.html')) continue;
  const html = await readFile(`dist/${file}`, 'utf8');
  const name = file.replaceAll('\\', '/');
  if (html.includes('id="baagh-prerender"')) actualBodies.push(name);
  else assert(html.includes('<div id="root"></div>'), `Unexpected initial body: ${name}`);
}
assert.deepEqual(actualBodies.sort(), expectedBodies, 'Exactly four canonical prerendered bodies required');
