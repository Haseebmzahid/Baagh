import test from 'node:test';
import assert from 'node:assert/strict';
import { orderRequestMessage, validateDelivery, formatMoney } from '../src/basket/orderRequest.ts';

// Fictional delivery data. No external messages are sent by these tests.
const details = { name: '  Test Customer  ', contact: '+44 7700 900123', address: '  Test address\nTest city  ', note: 'Please call on arrival.' };
const items = [
  { name: 'Chaunsa Mango', pack: '5 kg crate', quantity: 2, unitPriceMinor: 185000, provisional: true },
  { name: 'Chaunsa Mango', pack: '2 kg', quantity: 1, unitPriceMinor: 82000, provisional: true },
];

test('required delivery fields reject blank and whitespace-only values', () => {
  const errors = validateDelivery({ name: ' ', contact: '', address: '\n ', note: '' });
  assert.deepEqual(Object.keys(errors), ['name', 'contact', 'address']);
  assert.deepEqual(validateDelivery({ ...details, note: '' }), {});
});

test('contact may be local or international and is independent of the WhatsApp destination', () => {
  for (const contact of ['0304 4323073', '+44 (7700) 900-123', '020 7946 0123']) {
    assert.equal(validateDelivery({ ...details, contact }).contact, undefined);
  }
  for (const contact of ['phone', '123', '+1234567890123456', '+44 abc 7700900123', '++447700900123']) {
    assert.ok(validateDelivery({ ...details, contact }).contact);
  }
});

test('overlong fields are rejected without silently truncating delivery data', () => {
  assert.ok(validateDelivery({ ...details, name: 'x'.repeat(101) }).name);
  assert.ok(validateDelivery({ ...details, address: 'x'.repeat(1001) }).address);
  assert.ok(validateDelivery({ ...details, note: 'x'.repeat(501) }).note);
});

test('message contains exact packs, quantities, unit and line estimates, and subtotal', () => {
  const message = orderRequestMessage(items, details, 'PKR');
  assert.match(message, /1\. Chaunsa Mango\n   Pack: 5 kg crate\n   Quantity: 2/);
  assert.match(message, /2\. Chaunsa Mango\n   Pack: 2 kg\n   Quantity: 1/);
  assert.match(message, /Unit price \(provisional estimate\): PKR 1,850/);
  assert.match(message, /Line amount \(provisional estimate\): PKR 3,700/);
  assert.match(message, /Items subtotal \(provisional estimate\): PKR 4,520/);
  assert.match(message, /Customer name: Test Customer\nContact number: \+44 7700 900123/);
  assert.match(message, /Delivery address:\nTest address\nTest city/);
  assert.match(message, /ORDER NOTE\nPlease call on arrival\./);
});

test('an order request never promises price, delivery, availability or confirmation', () => {
  const message = orderRequestMessage(items, details, 'PKR');
  assert.match(message, /^BAAGH — ORDER REQUEST \(NOT CONFIRMED\)/);
  assert.match(message, /Please confirm final prices, delivery fees, availability and delivery timing\./);
  assert.match(message, /not a confirmed order\./);
  assert.match(message, /Delivery fees are not included\. No final total has been agreed\./);
  assert.doesNotMatch(message, /Estimated total|Order confirmed|Order number/i);
});

test('optional notes are omitted when empty; displayed prices are labelled accurately', () => {
  const message = orderRequestMessage([{ ...items[0], provisional: false }], { ...details, note: '\n ' }, 'PKR');
  assert.doesNotMatch(message, /ORDER NOTE|provisional estimate/);
  assert.match(message, /Unit price \(displayed\): PKR 1,850/);
  assert.match(message, /Items subtotal \(displayed\): PKR 3,700/);
});

test('invalid or empty requests cannot generate a handoff message', () => {
  assert.throws(() => orderRequestMessage([], details, 'PKR'));
  assert.throws(() => orderRequestMessage(items, { ...details, address: '' }, 'PKR'));
  for (const quantity of [0, 10, 1.5]) assert.throws(() => orderRequestMessage([{ ...items[0], quantity }], details, 'PKR'));
  for (const unitPriceMinor of [-1, 1.5, NaN, Infinity]) assert.throws(() => orderRequestMessage([{ ...items[0], unitPriceMinor }], details, 'PKR'));
});

test('Unicode and message punctuation survive URL encoding; decimal prices retain cents', () => {
  const message = orderRequestMessage(items, { ...details, name: 'آزمائش', note: 'Gate A & B + call #2' }, 'PKR');
  assert.equal(decodeURIComponent(encodeURIComponent(message)), message);
  assert.equal(formatMoney(82050, 'PKR'), 'PKR 820.50');
});
