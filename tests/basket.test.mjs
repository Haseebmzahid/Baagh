import test from 'node:test';
import assert from 'node:assert/strict';
import { addLine, basketMessage, decodeBasket, encodeBasket, lineKey, priceInMinorUnits, setLineQuantity } from '../src/basket/model.ts';

const mango = { productId: 'chaunsa', packId: '5kg', quantity: 2 };

test('repeated adds merge only the matching product and pack, capped at nine', () => {
  let lines = addLine([], mango);
  lines = addLine(lines, { ...mango, packId: '2kg', quantity: 1 });
  lines = addLine(lines, { ...mango, productId: 'apple', quantity: 3 });
  lines = addLine(lines, { ...mango, quantity: 9 });
  assert.deepEqual(lines.map((line) => line.quantity), [9, 1, 3]);
});

test('setting quantity edits the correct pack and zero removes it', () => {
  const lines = [mango, { ...mango, packId: '2kg', quantity: 1 }];
  const updated = setLineQuantity(lines, lineKey(mango), 7);
  assert.deepEqual(updated.map((line) => line.quantity), [7, 1]);
  assert.deepEqual(setLineQuantity(updated, lineKey(mango), 0), [lines[1]]);
  assert.equal(lines[0].quantity, 2, 'previous state is not mutated');
});

test('invalid quantities cannot enter through adding, editing, or persisted data', () => {
  for (const quantity of [-1, 0, 1.5, 10, NaN, Infinity, '2']) {
    assert.deepEqual(addLine([], { ...mango, quantity }), []);
  }
  for (const quantity of [-1, 1.5, 10, NaN, Infinity]) {
    assert.deepEqual(setLineQuantity([mango], lineKey(mango), quantity), [mango]);
  }
  const loaded = decodeBasket(JSON.stringify({ version: 1, lines: [mango, { ...mango, quantity: 99 }] }));
  assert.deepEqual(loaded, { lines: [mango], recovered: true });
});

test('persisted selections round-trip without storing prices or personal data', () => {
  assert.deepEqual(decodeBasket(encodeBasket([mango])), { lines: [mango], recovered: false });
  const loaded = decodeBasket(JSON.stringify({ version: 1, lines: [{ ...mango, price: 1, phone: 'not retained' }] }));
  assert.deepEqual(loaded.lines, [mango]);
});

test('missing, corrupt and incompatible saved data recover without throwing', () => {
  assert.deepEqual(decodeBasket(null), { lines: [], recovered: false });
  for (const raw of ['broken', 'null', '[]', '{}', '{"version":2,"lines":[]}', '{"version":1,"lines":null}']) {
    assert.deepEqual(decodeBasket(raw), { lines: [], recovered: true });
  }
});

test('restoration merges duplicate lines, retaining the quantity ceiling', () => {
  const loaded = decodeBasket(JSON.stringify({ version: 1, lines: [mango, { ...mango, quantity: 8 }] }));
  assert.deepEqual(loaded, { lines: [{ ...mango, quantity: 9 }], recovered: true });
});

test('line identity cannot collide when ids contain separators', () => {
  assert.notEqual(lineKey({ productId: 'a:b', packId: 'c' }), lineKey({ productId: 'a', packId: 'b:c' }));
});

test('grouped catalogue prices use integer minor units and reject malformed prices', () => {
  assert.equal(priceInMinorUnits('1,850'), 185000);
  assert.equal(priceInMinorUnits('820.50'), 82050);
  assert.equal(priceInMinorUnits('0'), 0);
  for (const price of ['', '1,85', '-12', 'PKR 20', '12x', '1.234', 'Infinity']) {
    assert.equal(priceInMinorUnits(price), null);
  }
});

test('WhatsApp enquiry includes each selected pack and quantity without implying confirmation', () => {
  const message = basketMessage([{ name: 'Chaunsa Mango', pack: '5 kg crate', quantity: 2 }, { name: 'Chaunsa Mango', pack: '2 kg', quantity: 1 }]);
  assert.match(message, /5 kg crate — quantity 2/);
  assert.match(message, /2 kg — quantity 1/);
  assert.match(message, /not a confirmed order/);
  assert.match(message, /delivery fees/);
});
