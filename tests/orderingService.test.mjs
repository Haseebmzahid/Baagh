import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareOrderRequest } from '../src/basket/orderingService.ts';

const input = {
  items: [{ name: 'Chaunsa Mango', pack: '5 kg crate', quantity: 2, unitPriceMinor: 185000, provisional: true }],
  details: { name: 'Test Customer', contact: '+44 7700 900123', address: 'Fictional test address', note: 'Gate A & B' },
  currency: 'PKR', whatsappNumber: '923044323073',
};

test('ordering service prepares the exact customer-reviewed WhatsApp handoff', async () => {
  const result = await prepareOrderRequest(input);
  assert.equal(result.ok, true);
  const link = new URL(result.whatsappUrl);
  assert.equal(link.origin, 'https://wa.me');
  assert.equal(link.pathname, '/923044323073');
  assert.equal(link.searchParams.get('text'), result.message);
  assert.match(result.message, /provisional estimate/);
  assert.match(result.message, /not a confirmed order/);
});

test('invalid delivery details return field errors without a handoff URL', async () => {
  const result = await prepareOrderRequest({ ...input, details: { ...input.details, name: ' ', address: '' } });
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.fieldErrors), ['name', 'address']);
  assert.equal('whatsappUrl' in result, false);
});

test('invalid destination, currency or empty basket cannot create an external link', async () => {
  for (const override of [{ whatsappNumber: '' }, { whatsappNumber: 'https://example.com' }, { currency: '' }, { items: [] }]) {
    const result = await prepareOrderRequest({ ...input, ...override });
    assert.equal(result.ok, false);
    assert.equal('whatsappUrl' in result, false);
  }
});

test('preparing requests does not mutate or carry customer details between calls', async () => {
  const original = structuredClone(input);
  await prepareOrderRequest(input);
  assert.deepEqual(input, original);
  const result = await prepareOrderRequest({ ...input, details: { ...input.details, name: 'Another Test', address: 'Different fictional address', note: '' } });
  assert.equal(result.ok, true);
  assert.match(result.message, /Another Test/);
  assert.doesNotMatch(result.message, /Customer name: Test Customer|Fictional test address|ORDER NOTE/);
});
