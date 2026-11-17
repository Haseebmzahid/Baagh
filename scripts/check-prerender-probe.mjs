import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

// Keep the original failed fixture/evidence intact. This opt-in gate exercises
// the actual production bootstrap and writes to the new Phase 2A directory.
if (process.argv.includes('--production')) {
  await import('./verify-chaunsa.mjs');
  process.exit(process.exitCode ?? 0);
}

const probe = 'test-results/prerender-probe';
const evidence = 'docs/verification/seo-phase-2';
await mkdir(evidence, { recursive: true });
const manifest = JSON.parse(await readFile(`${probe}/client/.vite/manifest.json`, 'utf8'));
const entry = manifest['tests/prerender/ChaunsaProbe.tsx'];
const body = await readFile(`${probe}/body.html`, 'utf8');
const head = await readFile(`${probe}/head.html`, 'utf8');
const baseline = await readFile('dist/product/mangoes/chaunsa/index.html', 'utf8');
const fonts = baseline.match(/<link href="https:\/\/fonts.googleapis.com[^>]+>/)?.[0] ?? '';
const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${head}${fonts}${entry.css.map(file => `<link rel="stylesheet" href="/probe/${file}">`).join('')}</head><body><div id="root">${body}</div><script type="module" src="/probe/${entry.file}"></script></body></html>`;
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png' };
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, 'http://localhost').pathname;
    response.setHeader('Content-Type', types[extname(path)] ?? 'text/html');
    if (path === '/probe/chaunsa') return response.end(html);
    if (path === '/product/mangoes/chaunsa') return response.end(baseline);
    let file;
    if (path.startsWith('/probe/assets/')) file = resolve(probe, 'client', path.slice('/probe/'.length));
    else if (path.startsWith('/assets/')) file = resolve('dist', path.slice(1));
    else if (path.startsWith('/images/')) file = resolve('public', path.slice(1));
    if (!file || !file.startsWith(resolve('.') + '\\')) { response.statusCode = 404; return response.end('Not found'); }
    response.end(await readFile(file));
  } catch { response.statusCode = 404; response.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.BAAGH_CHROMIUM_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const results = [];
const dimensions = async page => page.evaluate(() => ({
  width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
  headingCount: document.querySelectorAll('h1').length,
  h1: document.querySelector('h1')?.textContent,
  headingRect: (() => { const r = document.querySelector('h1')?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null; })(),
  packSelectors: document.querySelectorAll('[aria-label="Pack size"]').length,
  canvasCount: document.querySelectorAll('canvas').length,
  canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
  headingPreserved: window.__probeOriginalHeading ? window.__probeOriginalHeading === document.querySelector('h1') : null,
  hydrationErrors: window.__probeHydrationErrors ?? [],
}));
try {
  for (const width of [1440, 375]) {
    const settings = { viewport: { width, height: width === 375 ? 812 : 900 }, isMobile: width === 375, hasTouch: width === 375 };
    const noJs = await browser.newPage({ ...settings, javaScriptEnabled: false });
    const response = await noJs.goto(`${origin}/probe/chaunsa`);
    assert.equal(response.status(), 200);
    await noJs.locator('h1').waitFor({ state: 'visible' });
    assert.equal(await noJs.locator('h1').textContent(), 'Chaunsa Mango');
    await noJs.evaluate(() => document.fonts.ready);
    await noJs.screenshot({ path: `${evidence}/chaunsa-no-js-${width}.png` });
    const initial = await dimensions(noJs);
    await noJs.close();

    const page = await browser.newPage(settings);
    const consoleErrors = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', error => consoleErrors.push(error.message));
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route(`**/probe/${entry.file}`, async route => { await gate; await route.continue(); });
    await page.goto(`${origin}/probe/chaunsa`, { waitUntil: 'commit' });
    await page.locator('h1').waitFor({ state: 'visible' });
    await page.evaluate(() => { window.__probeOriginalHeading = document.querySelector('h1'); });
    release();
    await page.waitForLoadState('load');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const hydrated = await dimensions(page);
    await page.screenshot({ path: `${evidence}/chaunsa-hydrated-${width}.png` });
    await page.goto(`${origin}/product/mangoes/chaunsa`);
    await page.locator('h1').waitFor({ state: 'visible' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${evidence}/chaunsa-baseline-${width}.png` });
    const existing = await dimensions(page);
    await page.close();
    results.push({ width, noJs: initial, hydrated, existing, consoleErrors });
  }
  await copyFile(`${probe}/node-results.json`, `${evidence}/node-results.json`);
  await writeFile(`${evidence}/chaunsa-diagnostic.html`, html);
  await writeFile(`${evidence}/browser-results.json`, JSON.stringify(results, null, 2));
  const passed = results.every(result => result.hydrated.headingPreserved
    && result.hydrated.hydrationErrors.length === 0
    && Math.abs(result.noJs.headingRect.x - result.existing.headingRect.x) < 1
    && Math.abs(result.noJs.headingRect.y - result.existing.headingRect.y) < 1);
  await writeFile(`${evidence}/gate-results.json`, JSON.stringify({
    passed, productionEnabled: false,
    reason: passed ? null : 'Unchanged responsive components do not preserve mobile no-JavaScript layout or matching hydration. Stop before expanding.',
  }, null, 2));
  console.log(JSON.stringify(results, null, 2));
  console.log(`FEASIBILITY GATE: ${passed ? 'PASS' : 'FAIL'}. This fixture is not a production implementation.`);
  if (!passed) process.exitCode = 1;
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
