/** Browser basket selections only. Catalogue facts and prices are never persisted. */
export const BASKET_KEY = 'baagh.basket.v1';
export const MAX_QUANTITY = 9;

export interface BasketLine {
  productId: string;
  packId: string;
  quantity: number;
}

export const lineKey = (line: Pick<BasketLine, 'productId' | 'packId'>): string =>
  JSON.stringify([line.productId, line.packId]);

function validLine(value: unknown): value is BasketLine {
  if (!value || typeof value !== 'object') return false;
  const v = value as BasketLine;
  return typeof v.productId === 'string' && v.productId.length > 0 && v.productId.length <= 100 &&
    typeof v.packId === 'string' && v.packId.length > 0 && v.packId.length <= 100 &&
    Number.isInteger(v.quantity) && v.quantity >= 1 && v.quantity <= MAX_QUANTITY;
}

export function addLine(lines: BasketLine[], incoming: BasketLine): BasketLine[] {
  if (!validLine(incoming)) return lines;
  const index = lines.findIndex((line) => lineKey(line) === lineKey(incoming));
  if (index < 0) return [...lines, { ...incoming }];
  return lines.map((line, i) => i === index
    ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + incoming.quantity) }
    : line);
}

export function setLineQuantity(lines: BasketLine[], key: string, quantity: number): BasketLine[] {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) return lines;
  if (quantity === 0) return lines.filter((line) => lineKey(line) !== key);
  return lines.map((line) => lineKey(line) === key ? { ...line, quantity } : line);
}

export function decodeBasket(raw: string | null): { lines: BasketLine[]; recovered: boolean } {
  if (raw === null) return { lines: [], recovered: false };
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') throw new Error('Invalid basket');
    const saved = data as { version?: unknown; lines?: unknown };
    if (saved.version !== 1 || !Array.isArray(saved.lines)) throw new Error('Unknown format');
    let lines: BasketLine[] = [];
    let recovered = false;
    for (const candidate of saved.lines) {
      if (validLine(candidate)) {
        if (lines.some((line) => lineKey(line) === lineKey(candidate))) recovered = true;
        lines = addLine(lines, {
          productId: candidate.productId, packId: candidate.packId, quantity: candidate.quantity,
        });
      } else recovered = true;
    }
    return { lines, recovered };
  } catch {
    return { lines: [], recovered: true };
  }
}

export function encodeBasket(lines: BasketLine[]): string {
  return JSON.stringify({ version: 1, lines });
}

/** Current catalogue uses grouped whole-rupee strings. Reject unknown formats. */
export function priceInMinorUnits(price: string): number | null {
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(price)) return null;
  const minor = Math.round(Number(price.replaceAll(',', '')) * 100);
  return Number.isSafeInteger(minor) && minor >= 0 ? minor : null;
}

export interface MessageLine {
  name: string;
  pack: string;
  quantity: number;
}

export function basketMessage(lines: MessageLine[]): string {
  return [
    'Hello BAAGH — I would like to enquire about this basket:',
    ...lines.map((line, i) => `${i + 1}. ${line.name} — ${line.pack} — quantity ${line.quantity}`),
    '',
    'Please confirm availability, current prices, delivery fees and delivery timing.',
    'I understand this is an enquiry, not a confirmed order.',
  ].join('\n');
}
