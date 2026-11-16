import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoute } from '../src/navigation/route.ts';
import { specimenFruitFor } from '../src/components/commercial/specimenRegistry.ts';

test('direct shopping routes resolve before rendering a cinematic scene', () => {
  for (const [path,view] of [['/everyday-fresh','everyday-fresh'],['/signature','signature'],['/basket','basket']]) {
    assert.equal(resolveRoute(path).view,view);
    assert.equal(resolveRoute(`${path}/`).view,view);
  }
});
test('canonical product routes and existing breadcrumb aliases resolve identically', () => {
  const expected = {view:'product',product:{categorySlug:'mangoes',slug:'chaunsa'}};
  assert.deepEqual(resolveRoute('/product/mangoes/chaunsa'),expected);
  assert.deepEqual(resolveRoute('/everyday-fresh/mangoes/chaunsa'),expected);
});
test('legacy header destinations work from a product or basket URL', () => {
  assert.equal(resolveRoute('/product/mangoes/chaunsa','#signature').view,'signature');
  assert.equal(resolveRoute('/fruit-intelligence/chaunsa','#signature-collection').view,'signature');
  assert.equal(resolveRoute('/basket','#everyday-fresh').view,'everyday-fresh');
  assert.equal(resolveRoute('/everyday-fresh','#order').view,'basket');
  assert.equal(resolveRoute('/signature','#corporate').view,'signature');
});
test('all existing Fruit Intelligence routes and legacy fruit links survive', () => {
  for (const fruit of ['chaunsa','kinnow','apple','anaar']) {
    const expected={view:'fruit-intelligence',fruit};
    assert.deepEqual(resolveRoute(`/fruit-intelligence/${fruit}`),expected);
    assert.deepEqual(resolveRoute('/',`#${fruit}`),expected);
    assert.deepEqual(resolveRoute('/','',fruit),expected);
  }
  assert.equal(resolveRoute('/everyday-fresh','', 'apple').view,'everyday-fresh');
});
test('specimen registry reuses supported fruit bodies and safely rejects unsupported categories', () => {
  assert.equal(specimenFruitFor('chaunsa','mangoes'),'chaunsa');
  assert.equal(specimenFruitFor('sindhri','mangoes'),'chaunsa');
  assert.equal(specimenFruitFor('unknown','citrus'),'kinnow');
  assert.equal(specimenFruitFor('unknown','boxes'),null);
});
