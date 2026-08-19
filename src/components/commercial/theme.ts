import { tokens } from '../../config/tokens';

/**
 * COMMERCIAL DESIGN SYSTEM — Stage 02, approved
 * =============================================
 *
 * Canonical reference:
 *   Design prototype/commercial/BAAGH Commercial System (1).html
 *
 * This is NOT a second design system. It re-exports the production tokens in
 * src/config/tokens.ts and names the additional roles the approved commercial
 * sheet specifies (deep canvas, leaf, ember, the glass tiers, the responsive
 * spacing table and the three motion levels).
 *
 * Rule 02 of the sheet: gold never exceeds roughly five percent of a screen.
 * It marks state and season, never decoration.
 */

export const commercial = {
  color: {
    ...tokens.color,

    /** Canvas — every commercial page. */
    canvas: '#16150f',
    /** Deep — heroes, Signature, image wells. */
    deep: '#100f0a',

    /** Ink ramp. The sheet lists 100 / 84 / 62 / 42. */
    ink: '#f6f1e6',
    ink84: 'rgba(244,239,228,.84)',
    ink70: 'rgba(242,236,224,.70)',
    ink62: 'rgba(242,236,224,.62)',
    ink50: 'rgba(242,236,224,.50)',
    ink42: 'rgba(242,236,224,.42)',

    /** Gold — season, links, one accent per view. */
    gold: '#e8cfa0',
    goldHover: '#f6d79a',
    gold80: 'rgba(232,207,160,.8)',
    gold70: 'rgba(232,207,160,.7)',

    /** Leaf — WhatsApp action only. Not platform green. */
    leaf: '#4a5a44',
    leafHover: '#57694f',
    /** Ember — "ending soon", "last crates", and error text. */
    ember: '#8c5a3c',
    emberText: '#c08356',

    /** Hairlines — structure instead of cards. 10–16%. */
    hair10: 'rgba(244,238,226,.10)',
    hair12: 'rgba(244,238,226,.12)',
    hair14: 'rgba(244,238,226,.14)',
    hair16: 'rgba(244,238,226,.16)',
    hair22: 'rgba(244,238,226,.22)',

    /** Faint fills used by hover and inactive controls. */
    fill04: 'rgba(244,238,226,.04)',
    fill06: 'rgba(244,238,226,.06)',
    fill09: 'rgba(244,238,226,.09)',
  },

  font: {
    /** Newsreader carries meaning. */
    serif: tokens.fontFamily.serif,
    /** IBM Plex Mono carries facts — origin, season, weight, state. */
    mono: tokens.fontFamily.mono,
  },

  breakpoints: tokens.breakpoints,

  /**
   * Rule 01 · Typography. Sizes are the desktop figures from the sheet; the
   * `clamp` floors are the mobile end of the same ramp.
   */
  type: {
    /** D1 · 62/200 · page title */
    d1: { size: 'clamp(38px, 4.4vw, 62px)', weight: 200, lineHeight: 1.06, letterSpacing: '-.018em' },
    /** D2 · 38/250 · section */
    d2: { size: 'clamp(27px, 2.7vw, 38px)', weight: 250, lineHeight: 1.12, letterSpacing: '-.008em' },
    /** P1 · 22/300 · product name */
    p1: { size: 'clamp(19px, 1.6vw, 22px)', weight: 300, lineHeight: 1.2, letterSpacing: '0' },
    /** B1 · 18/300 · body */
    b1: { size: 'clamp(16px, 1.25vw, 18px)', weight: 300, lineHeight: 1.62, letterSpacing: '0' },
    /** B2 · 17/300 italic · aside */
    b2: { size: 'clamp(15px, 1.2vw, 17px)', weight: 300, lineHeight: 1.6, letterSpacing: '0' },
    /** U1 · 10/.18em · fact line */
    u1: { size: '10px', weight: 400, lineHeight: 1.7, letterSpacing: '.18em' },
    /** U2 · 8.5/.22em · label */
    u2: { size: '8.5px', weight: 400, lineHeight: 1.5, letterSpacing: '.22em' },
    /** Section eyebrow numeral, 9/.24em. */
    eyebrow: { size: '9px', weight: 400, lineHeight: 1.5, letterSpacing: '.24em' },
  },

  /**
   * Rule 08 · Responsive spacing. Follow the table, do not scale the desktop
   * figures. Grid is 12 / 8 / 4 columns.
   */
  layout: {
    desktop: { margin: 56, gutter: 28, section: 140, columns: 12 },
    tablet: { margin: 40, gutter: 22, section: 104, columns: 8 },
    mobile: { margin: 22, gutter: 14, section: 76, columns: 4 },
    maxWidth: 1320,
  },

  /**
   * Rule 03 · Glass. Architectural glass, not glassmorphism. Three tiers only.
   * Glass exists where something must float above photography — nowhere else.
   * It is refused on product cards, grids, body sections, cart, checkout and
   * forms; those use canvas and hairlines.
   */
  glass: {
    /** G1 · Vitrine — hero panels, price plate, sticky order bar. */
    vitrine: {
      backdropFilter: 'blur(18px) saturate(115%)',
      WebkitBackdropFilter: 'blur(18px) saturate(115%)',
      background: 'rgba(22,19,13,.55)',
      border: '1px solid rgba(244,238,226,.16)',
      boxShadow: '0 30px 60px -34px rgba(0,0,0,.8), inset 0 1px 0 rgba(244,238,226,.09)',
    } as const,
    /** G2 · Shelf — collection tiles, availability strip. No drop shadow. */
    shelf: {
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      background: 'rgba(22,19,13,.34)',
      border: '1px solid rgba(244,238,226,.11)',
    } as const,
    /** G3 · Rail — chrome that travels. Hairline base only, no border box. */
    rail: {
      backdropFilter: 'blur(22px) saturate(120%)',
      WebkitBackdropFilter: 'blur(22px) saturate(120%)',
      background: 'rgba(18,17,12,.74)',
      borderBottom: '1px solid rgba(244,238,226,.10)',
    } as const,
  },

  /**
   * Rule 08 · Motion budget.
   *   L1 cinematic — heroes, Signature, specimen. Camera drift ≤ 8s loop.
   *   L2 interactive — cards, tiles, rails. Tilt ≤ 4°, 450ms ease-out.
   *   L3 functional — cart, checkout, forms. Opacity and 120ms only.
   * Reduced motion drops L1 to a still frame.
   */
  motion: {
    l1: { driftSeconds: 8, signatureDriftSeconds: 32 },
    l2: { duration: '450ms', maxTiltDeg: 4, ease: 'cubic-bezier(0.22,0.61,0.36,1)' },
    l3: { duration: '120ms', ease: 'ease-out' },
    ease: 'cubic-bezier(0.22,0.61,0.36,1)',
  },

  radius: {
    /** Squared corners at 2px. */
    button: '2px',
    plate: '2px',
  },

  /** Buttons: 52px tall on desktop, 56px on mobile. */
  control: {
    heightDesktop: 52,
    heightMobile: 56,
    /** Mobile hit targets never below 44px. */
    minTap: 44,
  },

  /** Rule 08 · Focus — 1px gold ring at 2px offset, never removed. */
  focusRing: '1px solid #e8cfa0',
  focusRingOffset: '2px',
} as const;

/**
 * Rule 06 · State mark. One word, mono 8px, top right of the plate.
 * Absent by default — "steady" renders nothing.
 */
export type ProductState = 'peak' | 'ending' | 'preorder' | 'signature' | 'closed' | 'steady';

export type CommercialTheme = typeof commercial;

/** Per-tier layout figures from the responsive spacing table. */
export function layoutFor(tier: 'mobile' | 'tablet' | 'desktop') {
  return commercial.layout[tier];
}
