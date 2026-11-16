import { defineConfig } from '@playwright/test';

const previewPort = process.env.BAAGH_PREVIEW_PORT ?? '4173';

export default defineConfig({
  testDir: './tests/browser',
  timeout: 180000,
  expect: { timeout: 20000 },
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${previewPort}`,
    launchOptions: {
      ...(process.env.BAAGH_CHROMIUM_PATH ? { executablePath: process.env.BAAGH_CHROMIUM_PATH } : {}),
      args: [...(process.env.BAAGH_SOFTWARE_WEBGL === '1' ? ['--use-angle=swiftshader'] : []), '--enable-webgl'],
    },
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  ],
  webServer: { command: `npm run preview -- --host 127.0.0.1 --port ${previewPort}`, url: `http://127.0.0.1:${previewPort}`, reuseExistingServer: false },
});
