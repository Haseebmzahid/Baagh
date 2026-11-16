import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { absoluteUrl } from '../../src/seo/config';
import { escapeHtml } from '../../src/seo/head';

const publicPages: { path: string; title: string; description: string }[] = JSON.parse(readFileSync('dist/seo-manifest.json', 'utf8'));

// Scene motion has its own full-progress regression suite. Route/metadata
// checks use the site's existing reduced-motion mode to avoid idle GPU work.
test.use({ reducedMotion: 'reduce' });

test('public routes: initial metadata, direct access, refresh and mobile layout', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const expected of publicPages) {
    const response = await page.goto(expected.path);
    expect(response?.status()).toBe(200);
    const html = await response!.text();
    expect(html).toContain(`<title>${escapeHtml(expected.title)}</title>`);
    expect(html).toContain(`href="${absoluteUrl(expected.path)}"`);
    expect(html).toContain('application/ld+json');
    await expect(page).toHaveTitle(expected.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', absoluteUrl(expected.path));
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', expected.description);
    if (expected.path.startsWith('/fruit-intelligence/')) {
      await page.waitForFunction(id => (window as any).__fruitPerformance?.fruit === id, expected.path.split('/').pop());
    } else if (expected.path !== '/') {
      await expect(page.locator('h1').first()).toBeVisible();
    } else {
      await expect(page.locator('canvas').first()).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const missingAlt = await page.locator('img:not([alt])').count();
    expect(missingAlt).toBe(0);
    await page.reload();
    await expect(page).toHaveTitle(expected.title);
  }
  expect(errors).toEqual([]);
});

test('client navigation updates product metadata and removes stale schema', async ({ page }) => {
  await page.goto('/product/mangoes/chaunsa');
  await expect(page.locator('h1').first()).toBeVisible();
  await page.getByRole('navigation', { name: 'Breadcrumb', exact: true }).getByRole('link', { name: 'Everyday Fresh', exact: true }).click();
  await expect(page).toHaveTitle('Everyday Fresh — Fruit Collection | BAAGH');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', absoluteUrl('/everyday-fresh'));
  expect(await page.locator('script[type="application/ld+json"]').textContent()).not.toContain('"@type":"Product"');
  await page.goto('/everyday-fresh/citrus/kinnow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', absoluteUrl('/product/citrus/kinnow'));
  await page.goto('/product/citrus/does-not-exist');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await page.goto('/basket');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
});

test('crawler resources return actual files', async ({ request }) => {
  for (const [path, type, text] of [['/robots.txt', 'text/plain', 'User-agent: GPTBot'], ['/sitemap.xml', 'xml', '<urlset'], ['/llms.txt', 'text/plain', '# BAAGH']]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain(type);
    expect(await response.text()).toContain(text);
    expect(await response.text()).not.toContain('<div id="root">');
  }
});
