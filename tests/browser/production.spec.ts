import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const shots = 'docs/verification/performance-pages';
mkdirSync(shots, { recursive: true });

for (const fruit of ['chaunsa', 'kinnow', 'apple', 'anaar']) {
  test(`${fruit}: selected engine, scroll completion and scene cleanup`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    const scenes = new Set<string>();
    page.on('pageerror', error => { errors.push(error.message); console.error('Browser runtime error:', error.message); });
    page.on('request', request => { if (/\/(Chaunsa|Kinnow|Apple|Anaar)Scene-/.test(request.url())) scenes.add(request.url()); });
    await page.goto(`/fruit-intelligence/${fruit}`);
    await page.waitForFunction(id => (window as any).__fruitPerformance?.fruit === id, fruit);
    const metrics = await page.evaluate(() => {
      const gl = document.querySelector('canvas')?.getContext('webgl2');
      const debug = gl?.getExtension('WEBGL_debug_renderer_info');
      return { ...(window as any).__fruitPerformance, ...(window as any).__fruitScene.getDiagnostics(), renderer: gl && debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'unreported' };
    });
    writeFileSync(`${shots}/${fruit}-${testInfo.project.name}-metrics.json`, JSON.stringify({ ...metrics, phase: 'initial render' }, null, 2));
    expect(metrics.geometries).toBeGreaterThan(0);
    expect(scenes.size).toBe(1);
    await page.screenshot({ path: `${shots}/${fruit}-${testInfo.project.name}.jpg`, type: 'jpeg', quality: 82 });
    // Native scrolling exercises the real progress path rather than snapshot-only renderAt.
    for (const progress of [.22, .4, .57, .75, 1]) {
      await page.evaluate(p => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * p), progress);
      try {
        await page.waitForFunction(p => Math.abs((window as any).__fruitScene.getDiagnostics().progress - p) < .015, progress, { timeout: 20000 });
      } catch (error) {
        console.error('Stage failure', fruit, progress, await page.evaluate(() => ({ diagnostics: (window as any).__fruitScene?.getDiagnostics(), scroll: scrollY, max: document.documentElement.scrollHeight - innerHeight })), errors);
        throw error;
      }
    }
    await page.waitForFunction(() => (window as any).__fruitScene.getDiagnostics().progress > .999, undefined, { timeout: 20000 });
    await expect(page.locator('.fi-primary-cta')).toBeVisible();
    await expect(page.locator('.fi-primary-cta')).toHaveAttribute('tabindex', '0');
    await page.screenshot({ path: `${shots}/${fruit}-finish-${testInfo.project.name}.jpg`, type: 'jpeg', quality: 82 });
    await page.evaluate(() => { (window as any).__previousFruitScene = (window as any).__fruitScene; });
    await page.getByRole('button', { name: 'Reading view', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Try 3D view' })).toBeVisible();
    const disposed = await page.evaluate(() => (window as any).__previousFruitScene.getDiagnostics());
    expect(disposed.geometries).toBe(0);
    // Three can retain a bookkeeping entry for an internal texture even after
    // renderer disposal. Losing the owned context releases its GPU allocations.
    expect(disposed.textures).toBeLessThanOrEqual(1);
    expect(disposed.contextLost).toBe(true);
    expect(errors).toEqual([]);
    writeFileSync(`${shots}/${fruit}-${testInfo.project.name}-metrics.json`, JSON.stringify({ ...metrics, disposed, errors, rendering: 'Headless Chromium WebGL, renderer recorded above; not a physical-device FPS benchmark' }, null, 2));
  });
}

test('information pages, contact links and mobile widths', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => { errors.push(error.message); console.error('Browser runtime error:', error.message); });
  for (const path of ['our-story', 'contact', 'privacy-policy', 'cookies', 'terms', 'delivery', 'returns', 'help']) {
    await page.goto(`/${path}`);
    await expect(page.locator('main h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.title()).toContain('BAAGH');
    await expect(page.getByRole('navigation', { name: 'Policies', exact: true })).toBeVisible();
    if (['our-story', 'contact', 'privacy-policy'].includes(path)) await page.screenshot({ path: `${shots}/${path}-${testInfo.project.name}.jpg`, fullPage: true, type: 'jpeg', quality: 82 });
  }
  await page.goto('/contact');
  await expect(page.getByRole('link', { name: 'Call BAAGH' })).toHaveAttribute('href', 'tel:+923044323073');
  await expect(page.getByRole('link', { name: 'Chat on WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa.me\/923044323073/);
  // Use a footer link to verify client routing and page focus.
  await page.getByRole('navigation', { name: 'Policies', exact: true }).getByRole('link', { name: 'Privacy policy' }).click();
  await expect(page).toHaveURL(/privacy-policy/);
  await expect(page.locator('h1')).toBeFocused();
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/our-story');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('reduced motion, graphics fallback and basket access', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/fruit-intelligence/apple');
  await page.waitForFunction(() => (window as any).__fruitPerformance?.fruit === 'apple');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.locator('.fi-primary-cta')).toBeVisible();
  await page.evaluate(() => {
    document.querySelector('canvas')?.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
  });
  await expect(page.getByRole('button', { name: 'Try 3D view' })).toBeVisible();
  await page.goto('/fruit-intelligence/kinnow?fallback=true');
  await expect(page.getByRole('button', { name: 'Try 3D view' })).toBeVisible();
  await page.goto('/everyday-fresh#mangoes');
  await expect(page.getByRole('status').filter({ hasText: '1 fruit' })).toBeVisible();
  await page.getByRole('button', { name: 'Add Chaunsa Mango to basket', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
