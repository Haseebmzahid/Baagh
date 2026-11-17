// Isolated feasibility diagnostic: does not modify dist or production sources.
import { createServer, build } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

const output = 'test-results/prerender-probe';
await mkdir(output, { recursive: true });
const vite = await createServer({ configFile: false, mode: 'production', server: { middlewareMode: true }, appType: 'custom' });
try {
  let appError;
  try {
    const { App } = await vite.ssrLoadModule('/src/App.tsx');
    renderToString(React.createElement(App));
  } catch (error) { appError = String(error); }
  const { ChaunsaProbe } = await vite.ssrLoadModule('/tests/prerender/ChaunsaProbe.tsx');
  const started = performance.now();
  const body = renderToString(React.createElement(ChaunsaProbe));
  const renderMs = performance.now() - started;
  const { getProduct } = await vite.ssrLoadModule('/src/data/catalogue.ts');
  const product = getProduct('mangoes', 'chaunsa');
  const { renderHead } = await vite.ssrLoadModule('/src/seo/head.ts');
  const { seoForPath } = await vite.ssrLoadModule('/src/seo/pages.ts');
  await writeFile(`${output}/body.html`, body);
  await writeFile(`${output}/head.html`, renderHead(seoForPath('/product/mangoes/chaunsa')));
  await writeFile(`${output}/node-results.json`, JSON.stringify({
    fixtureOnly: true, appError, renderMs, bodyBytes: Buffer.byteLength(body),
    h1Count: (body.match(/<h1(?:\s|>)/g) ?? []).length,
    hasName: body.includes(product.name), hasDescription: body.includes(product.shortDescription),
    hasSelectionBody: body.includes(product.selection.body),
    hasFruitIntelligenceLink: body.includes('href="/fruit-intelligence/chaunsa"'),
    canvasCount: (body.match(/<canvas(?:\s|>)/g) ?? []).length,
  }, null, 2));
} finally { await vite.close(); }

// A separate diagnostic bundle allows actual hydrateRoot behavior to be tested.
await build({ configFile: false, base: '/probe/', build: {
  outDir: `${output}/client`, emptyOutDir: false,
  rollupOptions: { input: 'tests/prerender/ChaunsaProbe.tsx' },
  manifest: true,
} });
console.log(`Diagnostic fixture generated in ${output}; production files untouched.`);
