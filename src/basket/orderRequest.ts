/** Pure formatting/validation for a customer-sent request. No storage or network access. */
export interface DeliveryDetails {
  name: string;
  contact: string;
  address: string;
  note: string;
}

export type DeliveryErrors = Partial<Record<keyof DeliveryDetails, string>>;

export interface RequestItem {
  name: string;
  pack: string;
  quantity: number;
  unitPriceMinor: number;
  provisional: boolean;
}

export function validateDelivery(details: DeliveryDetails): DeliveryErrors {
  const errors: DeliveryErrors = {};
  if (!details.name.trim()) errors.name = 'Enter your name.';
  else if (details.name.trim().length > 100) errors.name = 'Use 100 characters or fewer.';
  const contact = details.contact.trim();
  const digits = contact.replace(/\D/g, '');
  if (!contact) errors.contact = 'Enter a contact number.';
  else if (!/^\+?[\d\s().-]+$/.test(contact) || digits.length < 7 || digits.length > 15) {
    errors.contact = 'Enter a phone number with 7–15 digits. Spaces, brackets and a leading + are allowed.';
  }
  if (!details.address.trim()) errors.address = 'Enter your delivery address.';
  else if (details.address.trim().length > 1000) errors.address = 'Use 1,000 characters or fewer.';
  if (details.note.trim().length > 500) errors.note = 'Use 500 characters or fewer.';
  return errors;
}

export function formatMoney(minor: number, currency: string): string {
  return `${currency} ${new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: minor % 100 ? 2 : 0, maximumFractionDigits: 2,
  }).format(minor / 100)}`;
}

export function orderRequestMessage(items: RequestItem[], details: DeliveryDetails, currency: string): string {
  if (!items.length || Object.keys(validateDelivery(details)).length) throw new Error('Review the basket and delivery details.');
  if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 9 ||
    !Number.isSafeInteger(item.unitPriceMinor) || item.unitPriceMinor < 0)) throw new Error('Invalid basket item.');
  const estimated = items.some((item) => item.provisional);
  const subtotal = items.reduce((sum, item) => sum + item.unitPriceMinor * item.quantity, 0);
  if (!Number.isSafeInteger(subtotal)) throw new Error('Invalid subtotal.');
  return [
    'BAAGH — ORDER REQUEST (NOT CONFIRMED)',
    '',
    'Hello BAAGH, I would like to request the following:',
    '',
    'ITEMS',
    ...items.flatMap((item, i) => {
      const qualifier = item.provisional ? ' (provisional estimate)' : ' (displayed)';
      return [
        `${i + 1}. ${item.name}`,
        `   Pack: ${item.pack}`,
        `   Quantity: ${item.quantity}`,
        `   Unit price${qualifier}: ${formatMoney(item.unitPriceMinor, currency)}`,
        `   Line amount${qualifier}: ${formatMoney(item.unitPriceMinor * item.quantity, currency)}`,
        '',
      ];
    }),
    `Items subtotal${estimated ? ' (provisional estimate)' : ' (displayed)'}: ${formatMoney(subtotal, currency)}`,
    'Delivery fees are not included. No final total has been agreed.',
    '',
    'DELIVERY DETAILS',
    `Customer name: ${details.name.trim()}`,
    `Contact number: ${details.contact.trim()}`,
    'Delivery address:',
    details.address.trim(),
    ...(details.note.trim() ? ['', 'ORDER NOTE', details.note.trim()] : []),
    '',
    'STAFF CONFIRMATION REQUIRED',
    'Please confirm final prices, delivery fees, availability and delivery timing.',
    'This is an order request only, not a confirmed order.',
  ].join('\n');
}
