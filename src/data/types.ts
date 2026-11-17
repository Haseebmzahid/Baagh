/**
 * BAAGH COMMERCIAL CATALOGUE — TYPES
 * ==================================
 *
 * The single typed contract for commercial product data. Everything the
 * commercial layer renders — Everyday Fresh, Product Detail, Signature, and
 * later the cart and checkout — is described here and supplied by
 * `src/data/catalogue.ts`.
 *
 * Two rules hold this together:
 *
 *   1. ONE SOURCE OF TRUTH. A value that can be derived is never stored. The
 *      headline price is read from the default pack, the product route is
 *      built from category + slug, and the state badge is computed from
 *      `availability`. No component re-states any of it.
 *
 *   2. PROVISIONAL DATA IS DECLARED, NOT ASSUMED. Anything not yet confirmed
 *      by the business is named in `Product.provisional`, and pricing carries
 *      a global flag. Nothing here asserts stock, delivery, lead times or
 *      supplier claims.
 */

import type { ProductState } from '../components/commercial/theme';

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

/**
 * Category ids double as route segments (/product/:category/:slug).
 *
 * These are the six the approved Everyday Fresh design sets out under
 * "Six ways in" — five fruit/product categories plus Family. No others.
 */
export type CategoryId =
  | 'mangoes'
  | 'citrus'
  | 'apples'
  | 'seasonal'
  | 'boxes'
  | 'family';

/** An inclusive month range, 0-indexed. May wrap the year end (Dec — Feb). */
export interface MonthWindow {
  from: number;
  to: number;
}

export interface Category {
  id: CategoryId;
  /** Route segment. Identical to `id`; named separately for readability. */
  slug: string;
  label: string;
  /** Availability line under the tile, mono. */
  note: string;
  /** Placeholder plate tint, until the photography library arrives. */
  tint: string;
  /**
   * Indicative season window. Present only on categories that represent a
   * fruit with a season; drives the Everyday Fresh availability strip.
   */
  window?: MonthWindow;
  /** Row label on the availability strip, where it differs from `label`. */
  windowLabel?: string;
  /** Sort order across tiles and filters. */
  order: number;
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

/**
 * The commercial state of a product. This is BUSINESS data — the visual badge
 * is derived from it by `stateMarkFor()` in the catalogue, so no component
 * ever hard-codes a product state.
 *
 *   available     · in season, ordering now
 *   limited       · in season, last crates — the window is closing
 *   out-of-season · the window has closed; returns next season
 *   coming-soon   · the window has not opened yet; pre-order
 *   unavailable   · not orderable for a reason other than season
 */
export type Availability =
  | 'available'
  | 'limited'
  | 'out-of-season'
  | 'coming-soon'
  | 'unavailable';

/** True while the product can be ordered at all. */
export const ORDERABLE: Record<Availability, boolean> = {
  available: true,
  limited: true,
  'out-of-season': false,
  'coming-soon': false,
  unavailable: false,
};

/**
 * Availability → the approved design system's state mark (Rule 06:
 * "One word, top right. Peak · Ending · Pre-order · Signature. Absent by
 * default."). `steady` renders nothing.
 */
export const STATE_MARK: Record<Availability, ProductState> = {
  available: 'steady',
  limited: 'ending',
  'out-of-season': 'closed',
  'coming-soon': 'preorder',
  unavailable: 'closed',
};

// ---------------------------------------------------------------------------
// Packs
// ---------------------------------------------------------------------------

/**
 * One purchasable pack of a product. This is where price lives — the product
 * has no separate price field, so the two can never drift apart.
 */
export interface PublishedProductReview {
  id: string;
  genuine: true;
  approved: true;
  author: string;
  body: string;
  rating: number;
  datePublished?: string;
}

export interface Pack {
  /** Explicit business verification; absent means unconfirmed. */
  priceConfirmed?: boolean;
  id: string;
  /** Full selector label, e.g. "5 kg crate". */
  label: string;
  /** Compact label for tight controls, e.g. "5 kg". */
  weightLabel: string;
  /** Machine-readable weight. `null` where the pack is sold by the item. */
  weightKg: number | null;
  /**
   * The figure only, already grouped for display, e.g. "1,850".
   * PROVISIONAL while `commerce.pricesAreProvisional` is true.
   */
  price: string;
  /** Indicative fruit count, e.g. "approx. 12—14 fruit". Never a guarantee. */
  approximateCount: string | null;
  /**
   * Whether this pack can be ordered. Not an inventory count — there is no
   * stock system, and none is implied.
   */
  available: boolean;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

/** Fruits with an existing Fruit Intelligence experience. Not modified here. */
export type FruitIntelligenceSlug = 'chaunsa' | 'kinnow' | 'apple' | 'anaar';

/**
 * A placeholder plate until real photography is supplied. `src` stays
 * undefined for now; the components fall back to the tinted specimen plate,
 * which is the approved treatment for unphotographed products.
 */
export interface ProductImage {
  /** Plate tint used while `src` is absent. */
  tint: string;
  /** Marked caption shown on the placeholder plate. */
  note?: string;
  /** Real asset path, once photography exists. */
  src?: string;
  alt?: string;
}

/**
 * Headline copy for the Everyday Fresh feature row. Optional — a product
 * without it falls back to its variety and short description, so featuring a
 * different product never requires a component change.
 */
export interface FeatureCopy {
  headline: string;
  body: string;
}

/** The approved "How this fruit is chosen" block on Product Detail. */
export interface SelectionStandard {
  title: string;
  body: string;
  selectionNote: string;
  ripenessNote: string;
}

/**
 * Names the fields on a product whose values are not yet confirmed by the
 * business. Rendered as a visible marker rather than hidden in a comment.
 */
export type ProvisionalField =
  | 'price'
  | 'origin'
  | 'season'
  | 'qualityGrade'
  | 'packs'
  | 'photography';

export interface Product {
  /** Set only after verifying the commercial availability state. */
  availabilityVerified?: boolean;
  reviews?: PublishedProductReview[];
  id: string;
  /** Route segment under the category. */
  slug: string;
  name: string;
  /** Short form for tight lines, e.g. "Chaunsa" for "Chaunsa Mango". */
  shortName: string;
  category: CategoryId;
  /** Fruit then variety word only — never a marketing phrase. */
  variety: string;

  /** One sentence, used as the Product Detail lead. */
  shortDescription: string;
  /** The longer body under "How this fruit is chosen". */
  description: string;

  origin: string;
  /** Machine-readable season window, for sorting and availability logic. */
  season: MonthWindow;
  /** Display form of the window, e.g. "June — August". */
  seasonLabel: string;
  /** The standard the fruit is graded to, e.g. "Single tier". */
  qualityGrade: string;

  availability: Availability;
  /** Shown in place of a price once the window has closed. */
  returnsNote?: string;

  image: ProductImage;
  gallery: ProductImage[];

  packs: Pack[];
  /** Which pack supplies the headline price. Must exist in `packs`. */
  defaultPackId: string;
  /** Currency label shown beside the figure. */
  priceUnit: string;

  isFeatured: boolean;
  isSeasonal: boolean;
  isSignature: boolean;
  isEveryday: boolean;

  /** Links to the existing Fruit Intelligence experience, where one exists. */
  fruitIntelligenceSlug?: FruitIntelligenceSlug;

  tags: string[];
  selection: SelectionStandard;
  /** Used only when the product leads the Everyday Fresh feature row. */
  feature?: FeatureCopy;

  /** Fields awaiting confirmed business data. */
  provisional: ProvisionalField[];
}

// ---------------------------------------------------------------------------
// Editorial collections
//
// Selections, boxes and Signature collections are groupings OF products, not a
// second product store. Each references the catalogue by product id so a
// product's facts are never restated.
// ---------------------------------------------------------------------------

/** A curated selection on Everyday Fresh ("Chosen for a reason"). */
export interface Selection {
  id: string;
  title: string;
  /** One line of purpose, in place of a fact pair. */
  purpose: string;
  /** Products in the selection. The item count is derived from this. */
  productIds: string[];
  /** Provisional "from" figure, as a display string. */
  fromPrice: string;
  tint: string;
}

/** A weekly box on Everyday Fresh. */
export interface Box {
  id: string;
  title: string;
  purpose: string;
  /** Provisional "from" figure. */
  fromPrice: string;
  tint: string;
  /** Fruit the box may draw on. Contents follow the season. */
  productIds: string[];
  /** The lead box in the composition. */
  primary?: boolean;
  badge?: string;
}

/** A Signature collection. Three, and only three, at a time. */
export interface SignatureCollection {
  id: string;
  /** "Collection 01" etc. */
  index: string;
  /** "open now" / "closing", or absent. */
  status?: string;
  title: string;
  purpose: string;
  /** Provisional "from" figure. */
  fromPrice: string;
  tint: string;
  productIds: string[];
  closing?: boolean;
}

/** A Signature gift box — a packaging size, not a fruit. */
export interface GiftBox {
  id: string;
  title: string;
  purpose: string;
  /** Provisional figure. */
  price: string;
  tint: string;
  /** How many fruit the box holds. */
  capacity: number;
  productIds: string[];
}

/**
 * The Everyday Fresh hero. Names a specific fruit, so it belongs with the
 * product data — changing which product leads the page is a data edit.
 */
export interface HeroCopy {
  headline: string;
  body: string;
  /** The product the hero is about. */
  productId: string;
}

/**
 * The Signature seasonal-closure block. Editorial copy about a product, so it
 * lives with the product data rather than inside the page.
 */
export interface SeasonalClosure {
  /** Eyebrow, e.g. "Seasonal · closing 31 August". */
  eyebrow: string;
  headline: string;
  body: string;
  tint: string;
  plateNote: string;
  /** The fruit the run is built from. */
  productIds: string[];
}

/** A labelled fact pair used by the specification and corporate panels. */
export interface FactPair {
  label: string;
  value: string;
}
