/**
 * BAAGH COMMERCIAL CATALOGUE — STRUCTURED PLACEHOLDER DATA
 * =======================================================
 *
 * Every figure, window and origin in this file is a PLACEHOLDER carried over
 * from the approved Stage 02 design references. None of it is verified
 * commercial data, and none of it is a business commitment.
 *
 * The approved design sheet states it directly:
 *   "All figures in this document are placeholders pending real pricing."
 *   "Operational details are placeholders."
 *   "No operational promise is made in this design."
 *
 * WHAT IS DELIBERATELY ABSENT, and must stay absent until it is supplied:
 *   - stock levels and inventory counts
 *   - delivery cities, windows, charges or guarantees
 *   - lead times and minimum order values
 *   - payment processors and checkout behaviour
 *   - freshness / returns policies
 *
 * TO GO LIVE: replace the `price` and `packs` values, set
 * `commerce.pricesAreProvisional` to false, and swap `tint` for real
 * photography. The components read everything through this module, so no
 * component needs to change.
 */

import type { ProductState } from '../components/commercial/theme';

export type { ProductState };

// ---------------------------------------------------------------------------
// Commerce configuration
// ---------------------------------------------------------------------------

export const commerce = {
  /** Primary market. */
  market: 'Pakistan',
  currency: 'PKR',

  /**
   * While true, every price renders beside a visible "placeholder" marker.
   * Flip to false only when real pricing has been supplied and verified.
   */
  pricesAreProvisional: true,

  /**
   * Ordering is WhatsApp-primary, checkout secondary.
   * The number is intentionally blank — supply the real business number here
   * and the deep links below start working. Until then the WhatsApp actions
   * fall back to a non-committal href.
   */
  whatsappNumber: '' as string,

  /** Checkout is a later phase. Nothing is wired to a processor. */
  checkoutEnabled: false,
} as const;

/** True once a real business number has been supplied above. */
export const whatsappConfigured: boolean = commerce.whatsappNumber.length > 0;

/**
 * Builds a wa.me deep link. While the number is unset this returns the
 * placeholder anchor the production chrome already uses; WhatsAppButton keeps
 * that anchor from navigating.
 */
export function whatsappHref(message: string): string {
  if (!whatsappConfigured) return '#order';
  return `https://wa.me/${commerce.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** The marker that sits beside a provisional figure. */
export const PRICE_NOTE = commerce.pricesAreProvisional ? 'placeholder' : '';

// ---------------------------------------------------------------------------
// Categories — Rule 07 tiles
// ---------------------------------------------------------------------------

export interface Category {
  id: string;
  label: string;
  slug: string;
  /** Count / availability line, mono. */
  note: string;
  tint: string;
}

export const categories: Category[] = [
  { id: 'mangoes', label: 'Mangoes', slug: 'mangoes', note: 'In season', tint: '#c8862f' },
  { id: 'citrus', label: 'Citrus', slug: 'citrus', note: 'December', tint: '#d97a2b' },
  { id: 'apples', label: 'Apples', slug: 'apples', note: 'August', tint: '#a8323a' },
  { id: 'seasonal', label: 'Seasonal', slug: 'seasonal', note: 'Melon now', tint: '#7c6a34' },
  { id: 'boxes', label: 'Fruit Boxes', slug: 'boxes', note: 'Five sizes', tint: '#5c5638' },
  { id: 'family', label: 'Family', slug: 'family', note: 'Weekly', tint: '#4a5a44' },
];

// ---------------------------------------------------------------------------
// Season windows — indicative only
// ---------------------------------------------------------------------------

export interface SeasonWindow {
  id: string;
  label: string;
  /** Zero-indexed month range, inclusive. Indicative, not a guarantee. */
  from: number;
  to: number;
  open: boolean;
}

export const seasonWindows: SeasonWindow[] = [
  { id: 'mango', label: 'Mango', from: 4, to: 8, open: true },
  { id: 'citrus', label: 'Citrus', from: 11, to: 2, open: false },
  { id: 'apple', label: 'Apple', from: 7, to: 10, open: false },
  { id: 'melon', label: 'Melon', from: 3, to: 7, open: true },
];

export const MONTH_INITIALS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

/** One purchasable pack of a product. All figures provisional. */
export interface Pack {
  id: string;
  /** Short selector label, e.g. "5 kg crate". */
  label: string;
  /** Compact label for tight selectors, e.g. "5 kg". */
  short: string;
  /** Figure only, already grouped. Provisional. */
  price: string;
  /** Full note shown under the price on Product Detail. Provisional. */
  note: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Fruit then variety word only — never a marketing phrase. */
  variety: string;
  origin: string;
  season: string;
  categoryId: string;
  /** Route segment, e.g. "mangoes". */
  categorySlug: string;
  tint: string;

  /** Default (card) price figure — mirrors the default pack. Provisional. */
  price: string;
  /** Default pack size shown on the card, e.g. "5 kg". */
  packSize: string;

  state?: ProductState;
  stateLabel?: string;
  /** Shown instead of a price when the product is out of season. */
  returnsNote?: string;

  /** Marked placeholder caption on the plate until photography arrives. */
  plateNote?: string;

  /** Canonical commercial route. */
  href: string;
  /** Existing Fruit Intelligence destination, where one exists. */
  fruitIntelligence?: string;

  /** Product Detail copy. */
  standardTitle?: string;
  standardBody?: string;
  selectionNote?: string;
  ripenessNote?: string;
  lead?: string;

  /** Pack selector on Product Detail. Provisional figures. */
  packs?: Pack[];

  /** Marks the oversized feature rows in the editorial grid. */
  feature?: boolean;
}

function route(categorySlug: string, slug: string): string {
  return `/product/${categorySlug}/${slug}`;
}

export const products: Product[] = [
  {
    id: 'chaunsa',
    slug: 'chaunsa',
    name: 'Chaunsa Mango',
    variety: 'White Chaunsa',
    origin: 'Multan',
    season: 'June — August',
    categoryId: 'mangoes',
    categorySlug: 'mangoes',
    tint: '#d99b34',
    price: '1,850',
    packSize: '5 kg',
    state: 'peak',
    href: route('mangoes', 'chaunsa'),
    fruitIntelligence: '/fruit-intelligence/chaunsa',
    plateNote: 'Specimen placeholder',
    lead: 'Graded by hand into one tier only. Fruit that does not meet it does not travel under our name.',
    standardTitle: 'One tier. No second grade.',
    standardBody:
      'Chaunsa is picked at colour break, held to ripen off the tree, and checked twice — once at the orchard, once before dispatch.',
    selectionNote: 'Hand-graded on size, skin and weight.',
    ripenessNote: 'Arrives two to three days from ready.',
    feature: true,
    packs: [
      { id: '2kg', label: '2 kg', short: '2 kg', price: '820', note: '2 kg · approx. 5—6 fruit' },
      { id: '5kg', label: '5 kg crate', short: '5 kg', price: '1,850', note: '5 kg crate · approx. 12—14 fruit' },
      { id: '10kg', label: '10 kg case', short: '10 kg', price: '3,480', note: '10 kg case · approx. 24—28 fruit' },
    ],
  },
  {
    id: 'anwar-ratol',
    slug: 'anwar-ratol',
    name: 'Anwar Ratol',
    variety: 'Ratol',
    origin: 'Rahim Yar Khan',
    season: 'June — July',
    categoryId: 'mangoes',
    categorySlug: 'mangoes',
    tint: '#c8912f',
    price: '1,650',
    packSize: '4 kg',
    state: 'ending',
    href: route('mangoes', 'anwar-ratol'),
    plateNote: 'Specimen placeholder',
    lead: 'A small fruit with a short window. Sweet through to the skin, and gone quickly.',
    standardTitle: 'Small fruit, short window.',
    standardBody:
      'Ratol is graded on weight rather than size, because the best of it never grows large. The last crates leave as the window closes.',
    selectionNote: 'Graded on weight, not size.',
    ripenessNote: 'Ready on arrival.',
    packs: [
      { id: '2kg', label: '2 kg', short: '2 kg', price: '880', note: '2 kg · approx. 9—11 fruit' },
      { id: '4kg', label: '4 kg crate', short: '4 kg', price: '1,650', note: '4 kg crate · approx. 18—22 fruit' },
    ],
  },
  {
    id: 'sindhri',
    slug: 'sindhri',
    name: 'Sindhri Mango',
    variety: 'Sindhri',
    origin: 'Mirpur Khas',
    season: 'May — July',
    categoryId: 'mangoes',
    categorySlug: 'mangoes',
    tint: '#cf9a2e',
    price: '1,420',
    packSize: '5 kg',
    state: 'steady',
    href: route('mangoes', 'sindhri'),
    plateNote: 'Specimen placeholder',
    lead: 'The long oval that opens the season. Steady, generous, and easy to cut.',
    standardTitle: 'The fruit that opens the season.',
    standardBody:
      'Sindhri is cut from the orchard first and holds its condition longer than the varieties that follow it.',
    selectionNote: 'Hand-graded on skin and length.',
    ripenessNote: 'Arrives three to four days from ready.',
    packs: [
      { id: '2kg', label: '2 kg', short: '2 kg', price: '640', note: '2 kg · approx. 4—5 fruit' },
      { id: '5kg', label: '5 kg crate', short: '5 kg', price: '1,420', note: '5 kg crate · approx. 10—12 fruit' },
    ],
  },
  {
    id: 'langra',
    slug: 'langra',
    name: 'Langra Mango',
    variety: 'Langra',
    origin: 'Multan',
    season: 'June — July',
    categoryId: 'mangoes',
    categorySlug: 'mangoes',
    tint: '#a89234',
    price: '1,380',
    packSize: '4 kg',
    state: 'ending',
    href: route('mangoes', 'langra'),
    plateNote: 'Specimen placeholder',
    lead: 'Green at the skin long after the flesh is ready. Judged by hand, never by colour.',
    standardTitle: 'Judged by hand, never by colour.',
    standardBody:
      'Langra stays green when it is ripe, so it is graded by feel and weight. It is the variety most often bought too early elsewhere.',
    selectionNote: 'Graded by feel and weight.',
    ripenessNote: 'Arrives two days from ready.',
    packs: [
      { id: '2kg', label: '2 kg', short: '2 kg', price: '720', note: '2 kg · approx. 4—6 fruit' },
      { id: '4kg', label: '4 kg crate', short: '4 kg', price: '1,380', note: '4 kg crate · approx. 9—12 fruit' },
    ],
  },
  {
    id: 'dasehri',
    slug: 'dasehri',
    name: 'Dasehri Mango',
    variety: 'Dasehri',
    origin: 'Punjab',
    season: 'June — July',
    categoryId: 'mangoes',
    categorySlug: 'mangoes',
    tint: '#c09a3a',
    price: '1,290',
    packSize: '4 kg',
    state: 'steady',
    href: route('mangoes', 'dasehri'),
    plateNote: 'Specimen placeholder',
    lead: 'Slim, fibreless, and the easiest of the season to eat straight from the hand.',
    standardTitle: 'Fibreless, and easy in the hand.',
    standardBody: 'Dasehri is cut small and graded tight, because the appeal is the eating, not the size.',
    selectionNote: 'Graded tight on size.',
    ripenessNote: 'Ready on arrival.',
    packs: [
      { id: '2kg', label: '2 kg', short: '2 kg', price: '680', note: '2 kg · approx. 6—8 fruit' },
      { id: '4kg', label: '4 kg crate', short: '4 kg', price: '1,290', note: '4 kg crate · approx. 13—16 fruit' },
    ],
  },
  {
    id: 'garma',
    slug: 'garma',
    name: 'Garma Melon',
    variety: 'Garma',
    origin: 'Punjab',
    season: 'April — August',
    categoryId: 'seasonal',
    categorySlug: 'seasonal',
    tint: '#9c8a3c',
    price: '920',
    packSize: 'single',
    state: 'peak',
    href: route('seasonal', 'garma'),
    plateNote: 'Specimen placeholder',
    lead: 'Cut to order and sold as one fruit, because half a melon is never as good.',
    standardTitle: 'Sold whole, cut to order.',
    standardBody: 'Garma is chosen on scent and the sound of the rind, both of which are judged by hand.',
    selectionNote: 'Chosen on scent and sound.',
    ripenessNote: 'Ready on arrival.',
    packs: [
      { id: 'single', label: 'Single', short: 'Single', price: '920', note: 'One fruit · approx. 1.6—2.2 kg' },
      { id: 'pair', label: 'Pair', short: 'Pair', price: '1,740', note: 'Two fruit · approx. 3.2—4.4 kg' },
    ],
  },
  {
    id: 'kinnow',
    slug: 'kinnow',
    name: 'Kinnow',
    variety: 'Kinnow',
    origin: 'Sargodha',
    season: 'December — February',
    categoryId: 'citrus',
    categorySlug: 'citrus',
    tint: '#e08a2c',
    price: '1,180',
    packSize: '5 kg',
    state: 'closed',
    stateLabel: 'Dec',
    returnsNote: 'Returns December',
    href: route('citrus', 'kinnow'),
    fruitIntelligence: '/fruit-intelligence/kinnow',
    plateNote: 'Specimen placeholder',
    lead: 'The winter fruit. Thin-skinned, deeply coloured, and only ever sold in its own window.',
    standardTitle: 'Only in its own window.',
    standardBody:
      'Kinnow is graded on skin tension and weight in the hand. Outside December to February we do not sell it.',
    selectionNote: 'Graded on skin tension and weight.',
    ripenessNote: 'Ready on arrival.',
    packs: [
      { id: '5kg', label: '5 kg crate', short: '5 kg', price: '1,180', note: '5 kg crate · approx. 30—36 fruit' },
      { id: '10kg', label: '10 kg case', short: '10 kg', price: '2,240', note: '10 kg case · approx. 60—72 fruit' },
    ],
  },
  {
    id: 'apple',
    slug: 'apple',
    name: 'Apple',
    variety: 'Crimson',
    origin: 'Northern orchards',
    season: 'August — November',
    categoryId: 'apples',
    categorySlug: 'apples',
    tint: '#a8323a',
    price: '1,340',
    packSize: '3 kg',
    state: 'preorder',
    returnsNote: 'Opens August',
    href: route('apples', 'apple'),
    fruitIntelligence: '/fruit-intelligence/apple',
    plateNote: 'Specimen placeholder',
    lead: 'Picked late, held cold, and graded on the snap rather than the shine.',
    standardTitle: 'Graded on the snap.',
    standardBody:
      'Apples are sorted on firmness and sugar, not on polish. Nothing is waxed before it travels under our name.',
    selectionNote: 'Sorted on firmness, not polish.',
    ripenessNote: 'Ready on arrival.',
    packs: [
      { id: '3kg', label: '3 kg', short: '3 kg', price: '1,340', note: '3 kg · approx. 16—20 fruit' },
      { id: '6kg', label: '6 kg case', short: '6 kg', price: '2,520', note: '6 kg case · approx. 32—40 fruit' },
    ],
  },
  {
    id: 'anaar',
    slug: 'anaar',
    name: 'Anaar',
    variety: 'Kandhari',
    origin: 'Highland orchards',
    season: 'September — November',
    categoryId: 'seasonal',
    categorySlug: 'seasonal',
    tint: '#a8202c',
    price: '1,560',
    packSize: '3 kg',
    state: 'preorder',
    returnsNote: 'Opens September',
    href: route('seasonal', 'anaar'),
    fruitIntelligence: '/fruit-intelligence/anaar',
    plateNote: 'Specimen placeholder',
    lead: 'Heavy for its size, and judged on weight before it is judged on colour.',
    standardTitle: 'Judged on weight first.',
    standardBody:
      'Kandhari anaar is graded by weight in the hand, because the deepest colour is not always the fullest fruit.',
    selectionNote: 'Graded by weight in the hand.',
    ripenessNote: 'Ready on arrival.',
    feature: true,
    packs: [
      { id: '3kg', label: '3 kg', short: '3 kg', price: '1,560', note: '3 kg · approx. 7—9 fruit' },
      { id: '6kg', label: '6 kg case', short: '6 kg', price: '2,980', note: '6 kg case · approx. 14—18 fruit' },
    ],
  },
];

export function getProduct(categorySlug: string, slug: string): Product | undefined {
  const cat = categorySlug.toLowerCase();
  const s = slug.toLowerCase();
  return products.find((p) => p.categorySlug === cat && p.slug === s);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug.toLowerCase());
}

/** Related products: same category first, then the rest of what is ready. */
export function relatedTo(product: Product, limit = 3): Product[] {
  const sameCategory = products.filter(
    (p) => p.id !== product.id && p.categoryId === product.categoryId && p.state !== 'closed'
  );
  const others = products.filter(
    (p) => p.id !== product.id && p.categoryId !== product.categoryId && p.state !== 'closed'
  );
  return [...sameCategory, ...others].slice(0, limit);
}

/** The featured product for the Everyday Fresh feature row. */
export const featuredProduct = products[0];

/** The grid, in the order the approved composition sets it. */
export const gridProducts: Product[] = [
  products[0], // Chaunsa · peak
  products[1], // Anwar Ratol · ending
  products[5], // Garma Melon · peak
  products[2], // Sindhri
  products[3], // Langra
  products[4], // Dasehri
];

// ---------------------------------------------------------------------------
// Curated selections — chosen for a reason, not for a shelf
// ---------------------------------------------------------------------------

export interface Selection {
  id: string;
  title: string;
  purpose: string;
  /** Item count plus a provisional "from" figure. */
  meta: string;
  tint: string;
}

export const selections: Selection[] = [
  {
    id: 'morning',
    title: 'For the morning table',
    purpose: 'Four fruits that cut cleanly before work.',
    meta: `4 items · from PKR 2,100${PRICE_NOTE ? ` · ${PRICE_NOTE}` : ''}`,
    tint: '#c6923a',
  },
  {
    id: 'guests',
    title: 'When guests come',
    purpose: 'Fruit that looks composed on a plate.',
    meta: `6 items · from PKR 3,600${PRICE_NOTE ? ` · ${PRICE_NOTE}` : ''}`,
    tint: '#a8323a',
  },
  {
    id: 'children',
    title: 'Easy for children',
    purpose: 'Soft, seedless, no knife needed.',
    meta: `5 items · from PKR 2,400${PRICE_NOTE ? ` · ${PRICE_NOTE}` : ''}`,
    tint: '#8a7a34',
  },
];

// ---------------------------------------------------------------------------
// Boxes — one decision, repeated weekly
// ---------------------------------------------------------------------------

export interface Box {
  id: string;
  title: string;
  purpose: string;
  /** Figure only. Provisional. */
  from: string;
  tint: string;
  /** The lead box in the composition. */
  primary?: boolean;
  badge?: string;
}

export const boxes: Box[] = [
  {
    id: 'family',
    title: 'The Family Box',
    purpose: 'A week of fruit for four. Contents follow the season.',
    from: '3,400',
    tint: '#b8862f',
    primary: true,
    badge: 'Most ordered',
  },
  {
    id: 'two',
    title: 'The Two Box',
    purpose: 'A smaller week, for two people.',
    from: '1,900',
    tint: '#9c7c38',
  },
  {
    id: 'mango',
    title: 'The Mango Box',
    purpose: 'Four varieties, chosen against each other.',
    from: '2,800',
    tint: '#cf9a2e',
  },
];

// ---------------------------------------------------------------------------
// Signature — a narrower selection, and a box built to carry it
// ---------------------------------------------------------------------------

export interface SignatureCollection {
  id: string;
  index: string;
  /** "open now" / "closing" / undefined. */
  status?: string;
  title: string;
  purpose: string;
  /** Figure only. Provisional. */
  from: string;
  tint: string;
  closing?: boolean;
}

export const signatureCollections: SignatureCollection[] = [
  {
    id: 'chaunsa-reserve',
    index: 'Collection 01',
    status: 'open now',
    title: 'The Chaunsa Reserve',
    purpose: 'Twelve fruit from a single orchard block, wrapped and numbered.',
    from: '6,800',
    tint: '#d99b34',
  },
  {
    id: 'orchard-pair',
    index: 'Collection 02',
    title: 'The Orchard Pair',
    purpose: 'Two varieties, chosen to be tasted against each other.',
    from: '4,200',
    tint: '#b8862f',
  },
  {
    id: 'seasons-end',
    index: 'Collection 03',
    status: 'closing',
    title: "The Season's End",
    purpose: 'The last crates of the window, assembled while it is still open.',
    from: '5,100',
    tint: '#8c5a3c',
    closing: true,
  },
];

export interface GiftBox {
  id: string;
  title: string;
  purpose: string;
  /** Figure only. Provisional. */
  price: string;
  tint: string;
}

export const giftBoxes: GiftBox[] = [
  { id: 'six', title: 'The Six', purpose: 'Six fruit · one variety', price: '3,900', tint: '#c6923a' },
  { id: 'twelve', title: 'The Twelve', purpose: 'Twelve fruit · two varieties', price: '6,800', tint: '#d99b34' },
  { id: 'eighteen', title: 'The Eighteen', purpose: 'Eighteen fruit · three varieties', price: '9,400', tint: '#b8862f' },
];

/**
 * Box specification. Materials are described; capacity and personalisation are
 * design intent. Nothing here is an operational promise.
 */
export const boxSpecification = [
  { label: 'Material', value: 'Rigid board · cotton' },
  { label: 'Capacity', value: '6 · 12 · 18 fruit' },
  { label: 'Personalisation', value: 'Card, hand-written' },
];

/**
 * Corporate gifting. Every operational figure is explicitly unconfirmed —
 * that is the approved design's own wording and it must not be filled in
 * with invented values.
 */
export const corporateFacts = [
  { label: 'Minimum', value: 'To be confirmed' },
  { label: 'Lead time', value: 'To be confirmed' },
  { label: 'Branding', value: 'Card and sleeve' },
  { label: 'Cities', value: 'To be confirmed' },
];

/**
 * Handling and delivery lines for Product Detail. Deliberately non-committal:
 * no cities, no windows, no guarantees.
 */
export const orderAssurances = [
  { label: 'Handling', value: 'Kept at temperature until dispatch' },
  { label: 'Delivery', value: 'Cities and windows to be confirmed' },
];
