import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const pages = JSON.parse(await readFile('dist/seo-manifest.json', 'utf8'));
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const robots = await readFile('dist/robots.txt', 'utf8');
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const titles = new Set();
const descriptions = new Set();
for (const page of pages) {
  const file = page.path === '/' ? 'dist/index.html' : `dist${page.path}/index.html`;
  const html = await readFile(file, 'utf8');
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
      for (const forbidden of ['offers', 'aggregateRating', 'review', 'availability', 'price']) assert(!(forbidden in node));
    }
    if (node['@type'] === 'BreadcrumbList') node.itemListElement.forEach((item, index) => assert.equal(item.position, index + 1));
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
