# Protected header — tap target findings

**Status:** Documented, NOT fixed. Raised during the Stage 02 commercial
implementation and deliberately left alone.

**Why it is not fixed here:** `SiteHeader` is a protected production area. The
Stage 02 brief states: *"Do not alter the existing header unnecessarily. If
existing protected header tap-target issues are encountered, document them
separately rather than expanding this task."*

## Findings

Measured at 375 × 812 (mobile preset, touch emulation) on `/everyday-fresh`,
`/product/mangoes/chaunsa` and `/signature`. The WCAG 2.2 target-size minimum
and the commercial system's own rule ("mobile hit targets never below 44px")
both want ≥ 44 px.

| Element | File | Measured height | Notes |
| --- | --- | --- | --- |
| `BAAGH` wordmark link | `src/components/dom/SiteHeader.tsx` | 21 px | Inline `<a>`, no padding; navigates to the journey. |
| `FRUIT INTELLIGENCE ▼` cabinet trigger | `src/components/dom/SiteHeader.tsx` | 39 px | `padding: 6px 12px`. Closest to passing. |
| `Order` link | `src/components/dom/SiteHeader.tsx` | 26 px | `padding: 6px 12px` on a 9.5 px mono label. |

These are pre-existing and unrelated to the commercial layer. No commercial
component reproduces them — every interactive element added in
`src/components/commercial/` measures ≥ 44 px on mobile (verified: zero
sub-44 px targets outside `<header>` on all three commercial routes).

## Suggested remedy, when the header is next opened

Raise the vertical padding rather than the font size, so the mobile chrome
keeps its current visual weight:

- wordmark: wrap in an inline-block with `padding-block: 12px; margin-block: -12px`
  (grows the hit area without moving the baseline — the technique used on the
  product-card name links in `src/components/commercial/ProductCard.tsx`);
- cabinet trigger and `Order`: `padding: 12px 14px`, or set an explicit
  `min-height: 44px`.

Each is a one-line change, but it touches protected chrome and should be
approved and regression-checked on the homepage and all four Fruit
Intelligence chapters before it lands.
