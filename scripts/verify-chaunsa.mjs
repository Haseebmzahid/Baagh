import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { chromium } from '@playwright/test';
import { expect as baseExpect } from '@playwright/test';
import assert from 'node:assert/strict';

const baseline = process.argv.includes('--baseline');
const expect = baseExpect.configure({ timeout: 20000 });
const root = resolve(baseline ? 'test-results/phase2a-baseline' : 'dist');
const evidence = 'docs/verification/seo-phase-2a';
const settled = process.argv.includes('--settled');
const baselinePrefix = settled ? 'baseline-settled' : 'baseline';
await mkdir(evidence, { recursive: true });
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.txt': 'text/plain', '.xml': 'application/xml', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    let file = resolve(root, `.${path}`);
    if (!file.startsWith(root + sep) && file !== root) { res.statusCode = 403; return res.end(); }
    try { if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html'); }
    catch {
      const route = config.rewrites.find(rule => rule.source === path) ?? config.rewrites.find(rule => rule.source.startsWith('/((') && new RegExp(`^${rule.source}$`).test(path));
      if (route) file = resolve(root, `.${route.destination}`);
    }
    res.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.statusCode = 404; res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.BAAGH_CHROMIUM_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=swiftshader', '--enable-webgl'] });
const measurements = page => page.evaluate(() => {
  const rect = selector => {
    const element = document.querySelector(selector); if (!element) return null;
    const r = element.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height };
  };
  return { h1: rect('h1'), photo: rect('.fruit-photo'), packs: rect('[aria-label="Pack size"]'),
    headingCount: document.querySelectorAll('h1').length, overflow: document.documentElement.scrollWidth > innerWidth,
    text: document.querySelector('#root').textContent, bodyHeight: document.documentElement.scrollHeight,
    hydrationErrors: window.__baaghHydrationErrors ?? [],
    sameH1: window.__originalH1 ? window.__originalH1 === document.querySelector('h1') : null,
    sameRootChild: window.__originalRootChild ? window.__originalRootChild === document.querySelector('#root').firstElementChild : null,
  };
});
const results = [];
const approved = baseline ? [] : JSON.parse(await readFile(`${evidence}/baseline.json`, 'utf8'));
try {
  for (const [width, height] of [[1440, 900], [768, 1024], [375, 812], [390, 844]]) {
    console.log(`Checking ${baseline ? 'baseline' : 'Chaunsa gate'} at ${width} × ${height}`);
    const settings = { viewport: { width, height }, isMobile: width < 1280, hasTouch: width < 1280, reducedMotion: 'reduce' };
    const page = await browser.newPage(settings);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    if (baseline) {
      await page.goto(`${origin}/product/mangoes/chaunsa`);
      await page.locator('h1').waitFor({ state: 'visible' });
      await page.evaluate(() => document.fonts.ready);
      if (settled) {
        await page.evaluate(() => { for (const image of document.images) image.loading = 'eager'; });
        await page.evaluate(() => Promise.all([...document.images].map(image => image.decode().catch(() => {}))));
      }
      await page.screenshot({ path: `${evidence}/${baselinePrefix}-${width}.png` });
      await page.screenshot({ path: `${evidence}/${baselinePrefix}-full-${width}.png`, fullPage: true });
      results.push({ width, height, metrics: await measurements(page), errors });
    } else {
      const noJs = await browser.newPage({ ...settings, javaScriptEnabled: false });
      const response = await noJs.goto(`${origin}/product/mangoes/chaunsa`);
      assert.equal(response.status(), 200);
      const html = await response.text();
      assert(html.includes('id="baagh-prerender"'));
      assert(html.includes('Graded by hand into one tier only.'));
      assert(html.includes('href="/fruit-intelligence/chaunsa"'));
      assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
      await noJs.locator('h1').waitFor({ state: 'visible' });
      await noJs.evaluate(() => document.fonts.ready);
      await noJs.evaluate(() => { for (const image of document.images) image.loading = 'eager'; });
      await noJs.evaluate(() => Promise.all([...document.images].map(image => image.decode().catch(() => {}))));
      await noJs.screenshot({ path: `${evidence}/no-js-${width}.png` });
      await noJs.screenshot({ path: `${evidence}/no-js-full-${width}.png`, fullPage: true });
      const staticMetrics = await measurements(noJs);
      await noJs.close();
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      await page.route('**/assets/*.js', async route => { await gate; await route.continue(); });
      await page.goto(`${origin}/product/mangoes/chaunsa`, { waitUntil: 'commit' });
      await page.locator('h1').waitFor({ state: 'visible' });
      await page.waitForFunction(() => [...document.querySelectorAll('link[rel="stylesheet"]')].every(link => link.sheet));
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => { for (const image of document.images) image.loading = 'eager'; });
      await page.evaluate(() => Promise.all([...document.images].map(image => image.decode().catch(() => {}))));
      await page.evaluate(() => { window.__originalH1 = document.querySelector('h1'); window.__originalRootChild = document.querySelector('#root').firstElementChild; });
      const before = await measurements(page);
      await page.screenshot({ path: `${evidence}/before-hydration-${width}.png` });
      release();
      await page.waitForLoadState('load');
      await page.waitForFunction(() => typeof window.__setExperience === 'function');
      await page.waitForTimeout(100);
      const after = await measurements(page);
      assert.equal(await page.locator('.product-composition img').evaluate(img => getComputedStyle(img).animationName), 'none', 'Reduced-motion image enhancement');
      await page.screenshot({ path: `${evidence}/hydrated-${width}.png` });
      await page.screenshot({ path: `${evidence}/hydrated-full-${width}.png`, fullPage: true });
      await writeFile(`${evidence}/current-${width}.json`, JSON.stringify({ noJs: staticMetrics, before, after, errors }, null, 2));
      assert(after.sameH1 && after.sameRootChild, 'Hydration must retain original nodes');
      assert.deepEqual(after.hydrationErrors, []);
      for (const metrics of [staticMetrics, before, after]) {
        assert.equal(metrics.headingCount, 1);
        assert.equal(metrics.overflow, false);
        for (const key of ['h1', 'photo', 'packs']) {
          const target = approved.find(row => row.width === width).metrics[key];
          for (const field of ['x', 'y', 'width', 'height']) assert(Math.abs(metrics[key][field] - target[field]) < 1, `${width}: ${key}.${field} ${metrics[key][field]} differs from approved baseline ${target[field]}`);
        }
      }
      await expect(page.locator('.product-primary-action button')).toHaveCount(1);
      await expect(page.locator('[aria-label="Pack size"]')).toHaveCount(1);
      await page.getByRole('group', { name: 'Pack size', exact: true }).getByRole('button', { name: '2 kg', exact: true }).click();
      await expect(page.getByRole('group', { name: 'Pack size', exact: true }).getByRole('button', { name: '2 kg', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
      await page.locator('.product-primary-action button').click();
      await expect(page.locator('dialog[open]')).toBeVisible();
      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('baagh.basket.v1')));
      assert.deepEqual(stored.lines, [{ productId: 'chaunsa', packId: '2kg', quantity: 2 }]);
      await page.getByRole('button', { name: 'Close basket', exact: true }).click();
      await expect(page.locator('.product-primary-action button')).toBeFocused();
      await page.reload();
      await expect(page.getByRole('button', { name: 'Open basket, 2 packs', exact: true })).toBeVisible();
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('baagh.basket.v1')).lines), stored.lines);
      // Keyboard/cabinet uses the existing real scene factories and close path.
      await page.locator('[data-cabinet-trigger="true"]').focus();
      await expect(page.locator('[data-cabinet-trigger="true"]')).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-cabinet-trigger="true"]')).toHaveAttribute('aria-expanded', 'true');
      const cabinet = page.getByRole('dialog', { name: 'Fruit Intelligence 3D Specimen Cabinet' });
      await expect(cabinet).toBeVisible();
      for (let step = 0; step < 4 && !(await cabinet.evaluate(element => element === document.activeElement)); step++) await page.keyboard.press('Tab');
      await expect(cabinet).toBeFocused();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-cabinet-trigger="true"]')).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('[data-cabinet-trigger="true"]')).toBeFocused();
      const crosslink = page.getByRole('link', { name: 'Learn how we select it', exact: true });
      await expect(crosslink).toHaveAttribute('href', '/fruit-intelligence/chaunsa');
      await crosslink.click();
      await expect(page).toHaveURL(/\/fruit-intelligence\/chaunsa$/);
      await page.waitForFunction(() => window.__fruitPerformance?.fruit === 'chaunsa');
      await page.goBack();
      await expect(page.locator('h1')).toHaveText('Chaunsa Mango');
      await page.goForward();
      await expect(page).toHaveURL(/\/fruit-intelligence\/chaunsa$/);
      await page.goBack();
      await expect(page.locator('h1')).toHaveText('Chaunsa Mango');
      assert.deepEqual(errors, [], 'Browser console/runtime errors');
      results.push({ width, height, noJs: staticMetrics, before, metrics: after, errors,
        interactions: 'PASS: single controls, pack/quantity/add, saved pack/quantity after reload, drawer focus, cabinet, Fruit Intelligence mount, Back/Forward' });
    }
    await page.close();
  }
  if (!baseline) {
    // A pre-existing multi-line customer basket must remain byte-for-byte
    // untouched during hydration; no automatic empty-state write is allowed.
    const saved = JSON.stringify({ version: 1, lines: [{ productId: 'chaunsa', packId: '10kg', quantity: 3 }, { productId: 'anaar', packId: '3kg', quantity: 2 }] });
    const customer = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await customer.addInitScript(value => {
      if (!localStorage.getItem('baagh.basket.v1')) localStorage.setItem('baagh.basket.v1', value);
      window.__customerFirstHeading = null;
      new MutationObserver(() => { window.__customerFirstHeading ??= document.querySelector('h1'); }).observe(document, { childList: true, subtree: true });
      window.__basketWrites = [];
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) { if (key === 'baagh.basket.v1') window.__basketWrites.push(value); return original.call(this, key, value); };
    }, saved);
    const customerErrors = [];
    customer.on('pageerror', error => customerErrors.push(error.message));
    customer.on('console', message => { if (message.type() === 'error') customerErrors.push(message.text()); });
    await customer.goto(`${origin}/product/mangoes/chaunsa`);
    await expect(customer.getByRole('button', { name: 'Open basket, 5 packs', exact: true })).toBeVisible();
    assert.equal(await customer.evaluate(() => localStorage.getItem('baagh.basket.v1')), saved);
    assert.deepEqual(await customer.evaluate(() => window.__basketWrites), []);
    assert(await customer.evaluate(() => window.__customerFirstHeading === document.querySelector('h1')));
    await customer.reload();
    await expect(customer.getByRole('button', { name: 'Open basket, 5 packs', exact: true })).toBeVisible();
    assert.equal(await customer.evaluate(() => localStorage.getItem('baagh.basket.v1')), saved);
    assert.deepEqual(await customer.evaluate(() => window.__basketWrites), []);
    assert(await customer.evaluate(() => window.__customerFirstHeading === document.querySelector('h1')));
    await customer.goto(`${origin}/product/mangoes/chaunsa#signature`);
    await expect(customer).toHaveTitle('Signature — Fruit Gifting | BAAGH');
    await customer.goto(`${origin}/product/mangoes/chaunsa#apple`);
    await customer.waitForFunction(() => window.__fruitPerformance?.fruit === 'apple');
    await customer.goto(`${origin}/?fruit=chaunsa`);
    await customer.waitForFunction(() => window.__fruitPerformance?.fruit === 'chaunsa');
    await customer.goto(`${origin}/everyday-fresh/mangoes/chaunsa`);
    await expect(customer.locator('h1')).toHaveText('Chaunsa Mango');
    assert.deepEqual(customerErrors, []);
    await customer.close();
    await writeFile(`${evidence}/saved-basket-and-aliases.json`, JSON.stringify({ result: 'PASS', lines: JSON.parse(saved).lines, errors: customerErrors }, null, 2));
  }
  await writeFile(`${evidence}/${baseline ? baselinePrefix : 'verification'}.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results.map(({ width, metrics, errors }) => ({ width, h1: metrics.h1, photo: metrics.photo, errors })), null, 2));
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
