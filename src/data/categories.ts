import type { Category, CategoryId, MonthWindow } from './types';

/**
 * BAAGH COMMERCIAL CATEGORIES
 * ===========================
 *
 * The six routes the approved Everyday Fresh design sets out under
 * "Six ways in". No category is invented here — adding one means the approved
 * design changed first.
 *
 * `window` is an INDICATIVE season, used to draw the availability strip. It is
 * not a delivery promise and not a stock statement.
 */

export const categories: Category[] = [
  {
    id: 'mangoes',
    slug: 'mangoes',
    label: 'Mangoes',
    note: 'In season',
    tint: '#c8862f',
    window: { from: 4, to: 8 },
    windowLabel: 'Mango',
    order: 1,
  },
  {
    id: 'citrus',
    slug: 'citrus',
    label: 'Citrus',
    note: 'December',
    tint: '#d97a2b',
    // Wraps the year end.
    window: { from: 11, to: 1 },
    windowLabel: 'Citrus',
    order: 2,
  },
  {
    id: 'apples',
    slug: 'apples',
    label: 'Apples',
    note: 'August',
    tint: '#a8323a',
    window: { from: 7, to: 10 },
    windowLabel: 'Apple',
    order: 3,
  },
  {
    id: 'seasonal',
    slug: 'seasonal',
    label: 'Seasonal',
    note: 'What the month allows',
    tint: '#7c6a34',
    window: { from: 8, to: 10 },
    windowLabel: 'Seasonal',
    order: 4,
  },
  {
    id: 'boxes',
    slug: 'boxes',
    label: 'Fruit Boxes',
    note: 'Contents follow the season',
    tint: '#5c5638',
    order: 5,
  },
  {
    id: 'family',
    slug: 'family',
    label: 'Family',
    note: 'Weekly',
    tint: '#4a5a44',
    order: 6,
  },
];

const BY_ID = new Map<string, Category>(categories.map((c) => [c.id, c]));

export function getCategory(id: string): Category | undefined {
  return BY_ID.get(id.toLowerCase());
}

export function categoryLabel(id: CategoryId): string {
  return BY_ID.get(id)?.label ?? id;
}

/** Categories that carry a season window, in strip order. */
export const seasonCategories: Category[] = categories
  .filter((c) => c.window)
  .sort((a, b) => a.order - b.order);

/** Month initials for the availability strip header. */
export const MONTH_INITIALS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

/** Whether a month index falls inside a window that may wrap the year end. */
export function monthInWindow(month: number, window: MonthWindow): boolean {
  return window.from <= window.to
    ? month >= window.from && month <= window.to
    : month >= window.from || month <= window.to;
}

/** Whether a window is open in the given month (defaults to today). */
export function windowIsOpen(window: MonthWindow, month = new Date().getMonth()): boolean {
  return monthInWindow(month, window);
}
