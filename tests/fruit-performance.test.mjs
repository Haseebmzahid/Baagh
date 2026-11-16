import test from 'node:test';
import assert from 'node:assert/strict';
import { createFrameBudget, damping, sceneQuality, shouldPublishFrame } from '../src/components/fruit-intelligence/core/performance.ts';
import { createSceneLoop } from '../src/components/fruit-intelligence/core/sceneLoop.ts';

test('damping settles at the same rate on 30, 60 and 120 Hz devices', () => {
  const results = [30, 60, 120].map(hz => {
    let shown = 0;
    for (let frame = 0; frame < hz; frame++) shown += (1 - shown) * damping(7, 1 / hz);
    return shown;
  });
  assert.ok(Math.max(...results) - Math.min(...results) < 1e-10);
  assert.ok(results[0] > .999);
});

test('constrained devices get a bounded graphics budget', () => {
  assert.equal(sceneQuality(1440, 900, 8, 8).pixelRatio, 1.5);
  for (const args of [[375, 812, 8, 8], [1440, 900, 4, 8], [1440, 900, 8, 4], [1440, 900, 8, 8, true]]) {
    assert.deepEqual(sceneQuality(...args), { lowPerformance: true, pixelRatio: 1 });
  }
  assert.equal(shouldPublishFrame(120, 100), false);
  assert.equal(shouldPublishFrame(150, 100), true);
});

test('adaptive quality ignores isolated stalls and reacts to sustained slow rendering', () => {
  const budget = createFrameBudget();
  assert.equal(budget(200, 200), false);
  for (let frame = 1; frame <= 60; frame++) assert.equal(budget(16.7, 200 + frame * 16.7), false);
  let changes = 0;
  for (let frame = 1; frame <= 20; frame++) if (budget(50, 1300 + frame * 50)) changes++;
  assert.equal(changes, 1);
  for (let frame = 1; frame <= 20; frame++) assert.equal(budget(50, 2300 + frame * 50), false, 'cooldown prevents repeated resizing');
});

test('scene loop pauses hidden tabs, resumes without time jumps, and cancels on disposal', () => {
  const original = { document: globalThis.document, requestAnimationFrame: globalThis.requestAnimationFrame, cancelAnimationFrame: globalThis.cancelAnimationFrame };
  const doc = new EventTarget(); doc.hidden = false;
  const callbacks = new Map(); let id = 0;
  globalThis.document = doc;
  globalThis.requestAnimationFrame = callback => { callbacks.set(++id, callback); return id; };
  globalThis.cancelAnimationFrame = id => callbacks.delete(id);
  const step = now => { const queued = [...callbacks.values()]; callbacks.clear(); queued.forEach(callback => callback(now)); };
  try {
    const frames = [];
    const loop = createSceneLoop((time, dt) => frames.push({ time, dt }));
    loop.start(); loop.start(); assert.equal(callbacks.size, 1);
    step(100); step(117); assert.equal(frames.length, 2);
    doc.hidden = true; doc.dispatchEvent(new Event('visibilitychange')); assert.equal(callbacks.size, 0);
    loop.invalidate(); assert.equal(callbacks.size, 0);
    doc.hidden = false; doc.dispatchEvent(new Event('visibilitychange')); step(9000);
    assert.ok(frames.at(-1).dt <= 1 / 60);
    loop.dispose(); assert.equal(callbacks.size, 0);
    loop.invalidate(); assert.equal(callbacks.size, 0);
    const still = createSceneLoop(() => {}, true);
    still.start(); step(9100); assert.equal(callbacks.size, 0);
    still.invalidate(); assert.equal(callbacks.size, 1);
    still.dispose();
  } finally { Object.assign(globalThis, original); }
});
