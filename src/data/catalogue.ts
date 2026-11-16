/**
 * BAAGH COMMERCIAL CATALOGUE — SINGLE SOURCE OF TRUTH
 * ==================================================
 *
 * Everything the commercial layer sells is defined here once. Everyday Fresh,
 * Product Detail and Signature all read from this module; none of them holds a
 * product list of its own, and none of them decides a product's state.
 *
 * DATA SAFETY
 * -----------
 * Prices, pack breakdowns and some origins are PROVISIONAL — the business has
 * not confirmed them. Each product names its unconfirmed fields in
 * `provisional`, and `commerce.pricesAreProvisional` gates the visible marker
 * that sits beside every figure.
 *
 * Nothing in this file asserts:
 *   stock or inventory · delivery cities, windows or charges · lead times ·
 *   minimum order values · supplier identities · payment processing ·
 *   freshness or returns policies
 *
 * Those are later phases and must not be invented here.
 *
 * TO GO LIVE
 * ----------
 *   1. Replace the `price` values in each product's `packs`.
 *   2. Confirm `origin`, `season` and `qualityGrade`, and clear the matching
 *      entries from `provisional`.
 *   3. Set `commerce.pricesAreProvisional` to false.
 *   4. Add `image.src` as photography arrives.
 * No component needs to change for any of that.
 */

import { getCategory } from './categories';
import { ORDERABLE, STATE_MARK } from './types';
import type {
  Availability,
  Box,
  FactPair,
  GiftBox,
  Pack,
  HeroCopy,
  Product,
  SeasonalClosure,
  Selection,
  SignatureCollection,
} from './types';
import type { ProductState } from '../components/commercial/theme';

export * from './types';
export * from './categories';

// ---------------------------------------------------------------------------
// Commerce configuration
// ---------------------------------------------------------------------------

export const commerce = {
  /** Primary market. */
  market: 'Pakistan',
  currency: 'PKR',

  /**
   * While true, every figure renders beside a visible "placeholder" marker.
   * Flip to false only once real pricing has been supplied and verified.
   */
  pricesAreProvisional: true,

  /**
   * Ordering is WhatsApp-primary, checkout secondary. The number is
   * intentionally blank — supply the real business number and the deep links
   * start working. Until then WhatsAppButton keeps the anchor inert.
   */
  whatsappNumber: '923044323073' as string,

  /** Checkout is a later phase. Nothing is wired to a processor. */
  checkoutEnabled: false,
} as const;

/** True once a real business number has been supplied above. */
export const whatsappConfigured: boolean = commerce.whatsappNumber.length > 0;

/** Builds a wa.me deep link, or the inert placeholder anchor. */
export function whatsappHref(message: string): string {
  if (!whatsappConfigured) return '#order';
  return `https://wa.me/${commerce.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** The marker that sits beside a provisional figure. */
export const PRICE_NOTE = commerce.pricesAreProvisional ? 'placeholder' : '';

/** Appends the provisional marker to a caption, when one is in force. */
export function withPriceNote(text: string): string {
  return PRICE_NOTE ? `${text} · ${PRICE_NOTE}` : text;
}

// ---------------------------------------------------------------------------
// Products
//
// The initial set proves the model end to end: one product per fruit that
// already has a Fruit Intelligence experience, across four categories and
// four different availability states.
// ---------------------------------------------------------------------------

export const products: Product[] = [
  {
    id: 'chaunsa',
    slug: 'chaunsa',
    name: 'Chaunsa Mango',
    shortName: 'Chaunsa',
    category: 'mangoes',
    variety: 'White Chaunsa',

    shortDescription:
      'Graded by hand into one tier only. Fruit that does not meet it does not travel under our name.',
    description:
      'Chaunsa is picked at colour break, held to ripen off the tree, and checked twice — once at the orchard, once before dispatch.',

    origin: 'Multan',
    season: { from: 5, to: 7 },
    seasonLabel: 'June — August',
    qualityGrade: 'Single tier',

    availability: 'available',

    image: { tint: '#d99b34', note: 'Specimen placeholder' },
    gallery: [],

    packs: [
      { id: '2kg', label: '2 kg', weightLabel: '2 kg', weightKg: 2, price: '820', approximateCount: 'approx. 5—6 fruit', available: true },
      { id: '5kg', label: '5 kg crate', weightLabel: '5 kg', weightKg: 5, price: '1,850', approximateCount: 'approx. 12—14 fruit', available: true },
      { id: '10kg', label: '10 kg case', weightLabel: '10 kg', weightKg: 10, price: '3,480', approximateCount: 'approx. 24—28 fruit', available: true },
    ],
    defaultPackId: '5kg',
    priceUnit: 'PKR',

    isFeatured: true,
    isSeasonal: true,
    isSignature: true,
    isEveryday: true,

    fruitIntelligenceSlug: 'chaunsa',
    tags: ['mango', 'peak', 'tree-ripened'],

    selection: {
      title: 'One tier. No second grade.',
      body:
        'Chaunsa is picked at colour break, held to ripen off the tree, and checked twice — once at the orchard, once before dispatch.',
      selectionNote: 'Hand-graded on size, skin and weight.',
      ripenessNote: 'Arrives two to three days from ready.',
    },

    feature: {
      headline: 'White Chaunsa, tree-ripened',
      body:
        'Left on the tree three days longer than the market standard. Sugar is higher, the window is shorter.',
    },

    provisional: ['price', 'packs'],
  },

  {
    id: 'kinnow',
    slug: 'kinnow',
    name: 'Kinnow Mandarin',
    shortName: 'Kinnow',
    category: 'citrus',
    variety: 'Kinnow',

    shortDescription:
      'The winter fruit. Thin-skinned, deeply coloured, and only ever sold inside its own window.',
    description:
      'Kinnow is graded on skin tension and weight in the hand. Outside its window we do not sell it.',

    origin: 'Sargodha',
    season: { from: 11, to: 1 },
    seasonLabel: 'December — February',
    qualityGrade: 'Single tier',

    availability: 'out-of-season',
    returnsNote: 'Returns December',

    image: { tint: '#e08a2c', note: 'Specimen placeholder' },
    gallery: [],

    packs: [
      { id: '5kg', label: '5 kg crate', weightLabel: '5 kg', weightKg: 5, price: '1,180', approximateCount: 'approx. 30—36 fruit', available: true },
      { id: '10kg', label: '10 kg case', weightLabel: '10 kg', weightKg: 10, price: '2,240', approximateCount: 'approx. 60—72 fruit', available: true },
    ],
    defaultPackId: '5kg',
    priceUnit: 'PKR',

    isFeatured: false,
    isSeasonal: true,
    isSignature: false,
    isEveryday: true,

    fruitIntelligenceSlug: 'kinnow',
    tags: ['citrus', 'winter'],

    selection: {
      title: 'Only in its own window.',
      body:
        'Kinnow is graded on skin tension and weight in the hand. It is one of the few fruits whose season we will not stretch.',
      selectionNote: 'Graded on skin tension and weight.',
      ripenessNote: 'Ready on arrival.',
    },

    provisional: ['price', 'packs'],
  },

  {
    id: 'apple',
    slug: 'apple',
    name: 'Apple',
    shortName: 'Apple',
    category: 'apples',
    variety: 'Crimson',

    shortDescription:
      'Picked late, held cold, and graded on the snap rather than the shine.',
    description:
      'Apples are sorted on firmness and sugar, not on polish. Nothing is waxed before it travels under our name.',

    origin: 'Northern orchards',
    season: { from: 7, to: 10 },
    seasonLabel: 'August — November',
    qualityGrade: 'Single tier',

    availability: 'coming-soon',
    returnsNote: 'Opens August',

    image: { tint: '#a8323a', note: 'Specimen placeholder' },
    gallery: [],

    packs: [
      { id: '3kg', label: '3 kg', weightLabel: '3 kg', weightKg: 3, price: '1,340', approximateCount: 'approx. 16—20 fruit', available: true },
      { id: '6kg', label: '6 kg case', weightLabel: '6 kg', weightKg: 6, price: '2,520', approximateCount: 'approx. 32—40 fruit', available: true },
    ],
    defaultPackId: '3kg',
    priceUnit: 'PKR',

    isFeatured: false,
    isSeasonal: true,
    isSignature: false,
    isEveryday: true,

    fruitIntelligenceSlug: 'apple',
    tags: ['apple', 'autumn'],

    selection: {
      title: 'Graded on the snap.',
      body:
        'Apples are sorted on firmness and sugar, not on polish. Nothing is waxed before it travels under our name.',
      selectionNote: 'Sorted on firmness, not polish.',
      ripenessNote: 'Ready on arrival.',
    },

    // Origin is a working description, not a confirmed sourcing region.
    provisional: ['price', 'packs', 'origin'],
  },

  {
    id: 'anaar',
    slug: 'anaar',
    name: 'Anaar',
    shortName: 'Anaar',
    category: 'seasonal',
    variety: 'Kandhari',

    shortDescription:
      'Heavy for its size, and judged on weight before it is judged on colour.',
    description:
      'Kandhari anaar is graded by weight in the hand, because the deepest colour is not always the fullest fruit.',

    origin: 'Highland orchards',
    season: { from: 8, to: 10 },
    seasonLabel: 'September — November',
    qualityGrade: 'Single tier',

    availability: 'limited',

    image: { tint: '#a8202c', note: 'Specimen placeholder' },
    gallery: [],

    packs: [
      { id: '3kg', label: '3 kg', weightLabel: '3 kg', weightKg: 3, price: '1,560', approximateCount: 'approx. 7—9 fruit', available: true },
      { id: '6kg', label: '6 kg case', weightLabel: '6 kg', weightKg: 6, price: '2,980', approximateCount: 'approx. 14—18 fruit', available: true },
    ],
    defaultPackId: '3kg',
    priceUnit: 'PKR',

    isFeatured: false,
    isSeasonal: true,
    isSignature: true,
    isEveryday: true,

    fruitIntelligenceSlug: 'anaar',
    tags: ['pomegranate', 'seasonal'],

    selection: {
      title: 'Judged on weight first.',
      body:
        'Kandhari anaar is graded by weight in the hand, because the deepest colour is not always the fullest fruit.',
      selectionNote: 'Graded by weight in the hand.',
      ripenessNote: 'Ready on arrival.',
    },

    provisional: ['price', 'packs', 'origin'],
  },
];

// ---------------------------------------------------------------------------
// Derived product values
//
// These exist so a value is never stored twice. Components call them instead
// of recomputing anything.
// ---------------------------------------------------------------------------

const BY_ID = new Map<string, Product>(products.map((p) => [p.id, p]));

export function getProductById(id: string): Product | undefined {
  return BY_ID.get(id.toLowerCase());
}

/** Resolves the /product/:category/:slug route. */
export function getProduct(categorySlug: string, slug: string): Product | undefined {
  const cat = categorySlug.toLowerCase();
  const s = slug.toLowerCase();
  return products.find((p) => p.category === cat && p.slug === s);
}

export function getProductBySlug(slug: string): Product | undefined {
  const s = slug.toLowerCase();
  return products.find((p) => p.slug === s);
}

/** Several products at once, in catalogue order, skipping unknown ids. */
export function getProducts(ids: string[]): Product[] {
  return ids.map((id) => BY_ID.get(id)).filter((p): p is Product => !!p);
}

/** The canonical commercial route for a product. */
export function routeOf(product: Product): string {
  return `/product/${product.category}/${product.slug}`;
}

/**
 * The product's Fruit Intelligence destination, or undefined where no study
 * exists. The route shape belongs here, not in a page.
 */
export function fruitIntelligenceRouteOf(product: Product): string | undefined {
  return product.fruitIntelligenceSlug
    ? `/fruit-intelligence/${product.fruitIntelligenceSlug}`
    : undefined;
}

/** The pack that supplies the headline price. */
export function defaultPack(product: Product): Pack {
  return product.packs.find((p) => p.id === product.defaultPackId) ?? product.packs[0];
}

/** The headline price figure — always the default pack's. */
export function priceOf(product: Product): string {
  return defaultPack(product).price;
}

/** The full caption under a price on Product Detail. */
export function packNote(pack: Pack): string {
  return pack.approximateCount ? `${pack.label} · ${pack.approximateCount}` : pack.label;
}

export function isOrderable(product: Product): boolean {
  return ORDERABLE[product.availability];
}

/**
 * The design system's state mark for a product (Rule 06). Signature products
 * that are otherwise unremarkable carry the Signature mark; a featured product
 * in an open window reads as Peak.
 *
 * Visual components render whatever this returns — they never inspect
 * `availability` themselves.
 */
export function stateMarkFor(product: Product): { state: ProductState; label?: string } {
  const base = STATE_MARK[product.availability];

  if (base === 'steady' && product.isFeatured) return { state: 'peak' };
  if (base === 'steady' && product.isSignature) return { state: 'signature' };

  // Out of season shows the month it returns, where one is given.
  if (base === 'closed' && product.returnsNote) {
    return { state: 'closed', label: product.returnsNote };
  }
  if (base === 'preorder' && product.returnsNote) {
    return { state: 'preorder', label: product.returnsNote };
  }

  return { state: base };
}

/**
 * The Everyday Fresh "Today at the house" panel.
 *
 * Derived from the catalogue so it can never name a product that is no longer
 * sold. The status words describe availability only — no grading times, no
 * dispatch claims, nothing operational is asserted here.
 */
export function todayAtTheHouse(limit = 3): { id: string; line: string }[] {
  const word = (p: Product): string => {
    switch (p.availability) {
      case 'available':
        return 'in season';
      case 'limited':
        return 'last crates';
      case 'coming-soon':
        return (p.returnsNote ?? 'coming soon').toLowerCase();
      case 'out-of-season':
        return (p.returnsNote ?? 'out of season').toLowerCase();
      default:
        return 'unavailable';
    }
  };

  // Orderable fruit first — the panel is a picture of what is ready.
  return [...everydayProducts()]
    .sort((a, b) => Number(isOrderable(b)) - Number(isOrderable(a)))
    .slice(0, limit)
    .map((p) => ({ id: p.id, line: `${p.shortName} · ${word(p)}` }));
}

/** The line shown in place of a price once a window has closed. */
export function unavailableNote(product: Product): string {
  return product.returnsNote ?? 'Returns next season';
}

/** The eyebrow above a product name on Product Detail. */
export function availabilityLabel(availability: Availability): string {
  switch (availability) {
    case 'available':
      return 'In season';
    case 'limited':
      return 'In season · last crates';
    case 'coming-soon':
      return 'Coming soon';
    case 'out-of-season':
      return 'Out of season';
    default:
      return 'Unavailable';
  }
}

/**
 * Feature-row copy, falling back to the product's own variety and short
 * description so any product can lead the row.
 */
export function featureCopyFor(product: Product): { headline: string; body: string } {
  return (
    product.feature ?? {
      headline: `${product.variety}, ${product.name.toLowerCase()}`,
      body: product.shortDescription,
    }
  );
}

// ---------------------------------------------------------------------------
// Selectors — the only way pages choose what to show
// ---------------------------------------------------------------------------

export function productsInCategory(categoryId: string): Product[] {
  return products.filter((p) => p.category === categoryId);
}

export const everydayProducts = (): Product[] => products.filter((p) => p.isEveryday);
export const featuredProducts = (): Product[] => products.filter((p) => p.isFeatured);
export const seasonalProducts = (): Product[] => products.filter((p) => p.isSeasonal);
export const signatureProducts = (): Product[] => products.filter((p) => p.isSignature);

/** The single product the Everyday Fresh feature row leads with. */
export function featuredProduct(): Product {
  return featuredProducts()[0] ?? products[0];
}

/**
 * Related products: same category first, then whatever else can be ordered,
 * then the rest — so the rail is never empty while the catalogue is small.
 */
export function relatedTo(product: Product, limit = 3): Product[] {
  const others = products.filter((p) => p.id !== product.id);
  const rank = (p: Product) =>
    (p.category === product.category ? 0 : 2) + (isOrderable(p) ? 0 : 1);
  return [...others].sort((a, b) => rank(a) - rank(b)).slice(0, limit);
}

/**
 * Filter chips for the Everyday Fresh grid, derived from the categories that
 * actually hold products. Adding a product to a new category adds its chip.
 */
export interface CatalogueFilter {
  id: string;
  label: string;
}

export function gridFilters(): CatalogueFilter[] {
  const present = new Set(everydayProducts().map((p) => p.category));
  const fromCategories = [...present]
    .map((id) => getCategory(id))
    .filter((c): c is NonNullable<ReturnType<typeof getCategory>> => !!c)
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ id: c.id, label: c.label }));

  return [{ id: 'all', label: 'All' }, ...fromCategories];
}

/** Applies a filter chip to the Everyday Fresh grid. */
export function filterProducts(filterId: string): Product[] {
  const all = everydayProducts();
  return filterId === 'all' ? all : all.filter((p) => p.category === filterId);
}

// ---------------------------------------------------------------------------
// Editorial collections — groupings of the products above, never a second store
// ---------------------------------------------------------------------------

export const selections: Selection[] = [
  {
    id: 'morning',
    title: 'For the morning table',
    purpose: 'Fruit that cuts cleanly before work.',
    productIds: ['chaunsa', 'apple'],
    fromPrice: '2,100',
    tint: '#c6923a',
  },
  {
    id: 'guests',
    title: 'When guests come',
    purpose: 'Fruit that looks composed on a plate.',
    productIds: ['anaar', 'chaunsa'],
    fromPrice: '3,600',
    tint: '#a8323a',
  },
  {
    id: 'children',
    title: 'Easy for children',
    purpose: 'Soft, seedless, no knife needed.',
    productIds: ['kinnow', 'apple'],
    fromPrice: '2,400',
    tint: '#8a7a34',
  },
];

/** "4 items · from PKR 2,100 · placeholder" — count derived, never restated. */
export function selectionMeta(selection: Selection): string {
  const count = selection.productIds.length;
  return withPriceNote(`${count} ${count === 1 ? 'item' : 'items'} · from PKR ${selection.fromPrice}`);
}

export const boxes: Box[] = [
  {
    id: 'family',
    title: 'The Family Box',
    purpose: 'A week of fruit for four. Contents follow the season.',
    fromPrice: '3,400',
    tint: '#b8862f',
    productIds: ['chaunsa', 'apple', 'anaar'],
    primary: true,
    badge: 'Most ordered',
  },
  {
    id: 'two',
    title: 'The Two Box',
    purpose: 'A smaller week, for two people.',
    fromPrice: '1,900',
    tint: '#9c7c38',
    productIds: ['chaunsa', 'apple'],
  },
  {
    id: 'mango',
    title: 'The Mango Box',
    purpose: 'The season’s mangoes, chosen against each other.',
    fromPrice: '2,800',
    tint: '#cf9a2e',
    productIds: ['chaunsa'],
  },
];

export const signatureCollections: SignatureCollection[] = [
  {
    id: 'chaunsa-reserve',
    index: 'Collection 01',
    status: 'open now',
    title: 'The Chaunsa Reserve',
    purpose: 'Twelve fruit from a single orchard block, wrapped and numbered.',
    fromPrice: '6,800',
    tint: '#d99b34',
    productIds: ['chaunsa'],
  },
  {
    id: 'orchard-pair',
    index: 'Collection 02',
    title: 'The Orchard Pair',
    purpose: 'Two varieties, chosen to be tasted against each other.',
    fromPrice: '4,200',
    tint: '#b8862f',
    productIds: ['chaunsa', 'anaar'],
  },
  {
    id: 'seasons-end',
    index: 'Collection 03',
    status: 'closing',
    title: "The Season's End",
    purpose: 'The last crates of the window, assembled while it is still open.',
    fromPrice: '5,100',
    tint: '#8c5a3c',
    productIds: ['anaar'],
    closing: true,
  },
];

export const giftBoxes: GiftBox[] = [
  { id: 'six', title: 'The Six', purpose: 'Six fruit · one variety', price: '3,900', tint: '#c6923a', capacity: 6, productIds: ['chaunsa'] },
  { id: 'twelve', title: 'The Twelve', purpose: 'Twelve fruit · two varieties', price: '6,800', tint: '#d99b34', capacity: 12, productIds: ['chaunsa', 'anaar'] },
  { id: 'eighteen', title: 'The Eighteen', purpose: 'Eighteen fruit · three varieties', price: '9,400', tint: '#b8862f', capacity: 18, productIds: ['chaunsa', 'anaar', 'apple'] },
];

/**
 * The Everyday Fresh hero. Copy is the approved Stage 02 wording, carried
 * here unchanged so the page holds no product copy of its own.
 */
export const everydayFreshHero: HeroCopy = {
  headline: 'Chaunsa is at its peak.',
  body: 'Graded this morning in Multan. Three weeks left in the window.',
  productId: 'chaunsa',
};

/**
 * The Signature seasonal closure. Copy is the approved Stage 02 wording,
 * carried here unchanged so the page holds no product copy of its own.
 */
export const seasonalClosure: SeasonalClosure = {
  eyebrow: 'Seasonal · closing 31 August',
  headline: 'The last of the Chaunsa, boxed for the table.',
  body:
    'A limited run assembled while the window is still open. When the fruit stops, the collection closes.',
  tint: '#8c5a3c',
  plateNote: 'Seasonal placeholder',
  productIds: ['chaunsa'],
};

// ---------------------------------------------------------------------------
// Static commercial copy
//
// Descriptive, never operational. Every unconfirmed value reads "To be
// confirmed" on purpose — do not fill these in with invented figures.
// ---------------------------------------------------------------------------

/** Signature box specification. Materials described; nothing promised. */
export const boxSpecification: FactPair[] = [
  { label: 'Material', value: 'Rigid board · cotton' },
  { label: 'Capacity', value: '6 · 12 · 18 fruit' },
  { label: 'Personalisation', value: 'Card, hand-written' },
];

/** Corporate gifting. Deliberately unconfirmed. */
export const corporateFacts: FactPair[] = [
  { label: 'Minimum', value: 'To be confirmed' },
  { label: 'Lead time', value: 'To be confirmed' },
  { label: 'Branding', value: 'Card and sleeve' },
  { label: 'Cities', value: 'To be confirmed' },
];

/** Handling and delivery on Product Detail. No cities, windows or guarantees. */
export const orderAssurances: FactPair[] = [
  { label: 'Handling', value: 'Kept at temperature until dispatch' },
  { label: 'Delivery', value: 'Cities and windows to be confirmed' },
];

// ---------------------------------------------------------------------------
// Integrity
//
// Collections reference products by id. This check makes those links real: a
// typo or a removed product fails loudly in development instead of silently
// rendering an empty collection.
// ---------------------------------------------------------------------------

if (import.meta.env.DEV) {
  const groups: { label: string; items: { id: string; productIds: string[] }[] }[] = [
    { label: 'selection', items: selections },
    { label: 'box', items: boxes },
    { label: 'signature collection', items: signatureCollections },
    { label: 'gift box', items: giftBoxes },
    { label: 'seasonal closure', items: [{ id: 'seasonal-closure', productIds: seasonalClosure.productIds }] },
    { label: 'everyday fresh hero', items: [{ id: 'hero', productIds: [everydayFreshHero.productId] }] },
  ];

  for (const group of groups) {
    for (const item of group.items) {
      const missing = item.productIds.filter((id) => !BY_ID.has(id));
      if (missing.length) {
        console.error(
          `[catalogue] ${group.label} "${item.id}" references unknown product(s): ${missing.join(', ')}`
        );
      }
    }
  }

  for (const p of products) {
    if (!p.packs.some((pack) => pack.id === p.defaultPackId)) {
      console.error(`[catalogue] product "${p.id}" has no pack matching defaultPackId "${p.defaultPackId}"`);
    }
  }
}
