import { expect, test, type Page } from '@playwright/test';
import { fruitRegistry } from '../../src/components/fruit-intelligence/fruits';
import type { FruitConfig } from '../../src/components/fruit-intelligence/core/types';

const viewports = [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
];

type Scene = { getDiagnostics(): { progress: number; geometries: number; textures: number; contextLost: boolean } };
type FruitWindow = Window & {
  __fruitScene?: Scene;
  __fruitPerformance?: { fruit: string };
  __baaghHydrationErrors?: string[];
};

async function expectReading(page: Page, config: FruitConfig) {
  const fruit = page.locator('.fi-page');
  await expect(fruit).toHaveAttribute('data-fi-mode', 'reading');
  await expect(page.locator('h1')).toHaveText(config.headline);
  const acts = fruit.locator('.fi-act');
  await expect(acts).toHaveCount(config.acts.length);
  for (const [index, act] of config.acts.entries()) {
    await expect(acts.nth(index).locator('h1, h2')).toHaveText(index === 0 ? config.headline : act.headline);
    await expect(acts.nth(index).getByText(act.body, { exact: true })).toBeVisible();
  }
  const anchors = config.anchors.filter(anchor => anchor.description.length);
  const cards = fruit.locator('.fi-characteristic');
  await expect(cards).toHaveCount(anchors.length);
  for (const [index, anchor] of anchors.entries()) {
    await expect(cards.nth(index).getByText(anchor.description, { exact: true })).toBeVisible();
  }
  const silhouette = fruit.getByRole('img', { name: config.name, exact: true });
  await expect(silhouette).toBeVisible();
  await expect(fruit.locator('.fi-viewer')).toBeHidden();
  await expect(fruit.locator('.fi-primary-cta')).toHaveAttribute('href', '/everyday-fresh');
  await expect(fruit.locator('.fi-secondary-cta')).toHaveAttribute('href', '/signature');
  const bounds = await silhouette.evaluate(element => {
    const { left, right, top } = element.getBoundingClientRect();
    return { left, right, documentTop: top + scrollY };
  });
  expect(bounds.left).toBeGreaterThan(0);
  expect(bounds.documentTop).toBeGreaterThan(100);
  expect(bounds.right).toBeLessThan(page.viewportSize()!.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test.describe('Fruit Intelligence production prerender', () => {
  for (const { config } of Object.values(fruitRegistry)) {
    for (const viewport of viewports) {
      test(`${config.id} at ${viewport.width}×${viewport.height}`, async ({ browser, page, request }, testInfo) => {
        test.skip(testInfo.project.name !== 'desktop', 'Explicit four-viewport matrix');
        const path = `/fruit-intelligence/${config.id}`;
        const response = await request.get(path);
        expect(response.ok()).toBe(true);
        const html = await response.text();
        expect(html).toMatch(/<div id="root"><div/);
        expect(html).toContain('id="baagh-prerender"');
        expect(html).not.toContain('Preparing your experience');

        const noJs = await browser.newContext({ baseURL: testInfo.project.use.baseURL, viewport, javaScriptEnabled: false });
        try {
          const reading = await noJs.newPage();
          await reading.goto(path);
          await expectReading(reading, config);
          await reading.screenshot({ path: testInfo.outputPath('no-js.png'), fullPage: true });
        } finally {
          await noJs.close();
        }

        const errors: string[] = [];
        const scenes = new Set<string>();
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => {
          if (message.type() === 'error') errors.push(`${message.text()} (${message.location().url})`);
        });
        page.on('request', request => {
          const scene = new URL(request.url()).pathname.match(/\/([A-Z][a-z]+)Scene-[^/]+\.js$/);
          if (scene) scenes.add(scene[1].toLowerCase());
        });
        await page.setViewportSize(viewport);
        await page.emulateMedia({ reducedMotion: 'reduce' });

        let releaseModule!: () => void;
        const hold = new Promise<void>(resolve => { releaseModule = resolve; });
        const module = /\/assets\/FruitIntelligence-[^/]+\.js$/;
        await page.route(module, async route => {
          await hold;
          await route.continue();
        });
        const requested = page.waitForRequest(module);
        await page.goto(path, { waitUntil: 'commit' });
        try {
          await requested;
          await expectReading(page, config);
          await expect(page.locator('.fi-page')).toHaveAttribute('data-fi-client', 'false');
          expect([...scenes]).toEqual([]);
          await page.evaluate(() => {
            const selectors = ['#root', '#root > div', '.fi-page', 'h1', '.fi-characteristic'];
            Object.assign(window, { __fruitPrerenderNodes: selectors.map(selector => document.querySelector(selector)) });
          });
        } finally {
          releaseModule();
        }

        await page.waitForFunction(id => {
          const state = window as FruitWindow;
          return state.__fruitPerformance?.fruit === id && state.__fruitScene;
        }, config.id);
        const fruit = page.locator('.fi-page');
        await expect(fruit).toHaveAttribute('data-fi-mode', 'interactive');
        await expect(fruit.locator('canvas')).toHaveCount(1);
        expect(await page.evaluate(() => [scrollY, (window as FruitWindow).__fruitScene!.getDiagnostics().progress])).toEqual([0, 0]);

        const canvas = await fruit.locator('canvas').boundingBox();
        await page.mouse.move(canvas!.width * .55, canvas!.height * .4);
        await page.mouse.down();
        await page.mouse.move(canvas!.width * .62, canvas!.height * .43);
        await page.mouse.up();
        await expect(fruit.locator('.fi-hint')).toHaveCount(0);

        for (const target of [.2, .6, 1]) {
          await page.evaluate(value => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * value), target);
          await page.waitForFunction(value =>
            Math.abs((window as FruitWindow).__fruitScene!.getDiagnostics().progress - value) < .015, target, { timeout: 20000 });
        }
        await expect(fruit.locator('.fi-primary-cta')).toBeVisible();
        await expect(fruit.locator('.fi-primary-cta')).toHaveAttribute('tabindex', '0');
        const scene = await page.evaluateHandle(() => (window as FruitWindow).__fruitScene!);
        await page.getByRole('button', { name: 'Reading view', exact: true }).press('Enter');
        await expectReading(page, config);
        await expect(fruit.locator('canvas')).toHaveCount(0);
        expect(await page.evaluate(() => (window as FruitWindow).__fruitScene)).toBeUndefined();
        const disposed = await scene.evaluate(engine => engine.getDiagnostics());
        expect(disposed.geometries).toBe(0);
        expect(disposed.textures).toBeLessThanOrEqual(1);
        expect(disposed.contextLost).toBe(true);

        await page.getByRole('button', { name: 'Try 3D view', exact: true }).press('Space');
        await page.waitForFunction(previous => {
          const scene = (window as FruitWindow).__fruitScene;
          return scene && scene !== previous && scene.getDiagnostics().progress === 0;
        }, scene);
        await expect(fruit.locator('canvas')).toHaveCount(1);
        expect([...scenes]).toEqual([config.id]);
        expect(await page.evaluate(() => {
          const { __fruitPrerenderNodes: initial, __baaghHydrationErrors = [] } = window as FruitWindow & {
            __fruitPrerenderNodes: Element[];
          };
          const selectors = ['#root', '#root > div', '.fi-page', 'h1', '.fi-characteristic'];
          return {
            sameNodes: selectors.every((selector, index) => initial[index] === document.querySelector(selector)),
            overflow: document.documentElement.scrollWidth > innerWidth,
            hydrationErrors: __baaghHydrationErrors,
          };
        })).toEqual({ sameNodes: true, overflow: false, hydrationErrors: [] });
        expect(errors).toEqual([]);
      });
    }
  }
});
