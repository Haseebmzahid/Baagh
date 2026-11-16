# Basket visual verification

Verified on 15 November 2026 against the running React/Vite application at `http://127.0.0.1:3001` using an isolated in-app browser.

## Observed checks

| Check | Result |
| --- | --- |
| Desktop drawer, 1280 × 720 and 1440 × 900 | Right-aligned drawer, subtle backdrop, live fruit specimen, pack controls and provisional subtotal render correctly. |
| Mobile sheet, 375 × 812 | Near-full-screen sheet; item area scrolls separately from the summary; main actions are visible. |
| Landscape phone, 667 × 375 | Initially clipped lower actions. Fixed by allowing the entire sheet to scroll on short viewports; visually verified all actions are reachable. |
| Mobile review route | Product, selected pack, quantity, subtotal and WhatsApp action render in the single-column review layout. |
| Multiple pack sizes | 5 kg and 2 kg Chaunsa packs remain distinct lines; subtotal reflects both. |
| Quantity change | Updating the 5 kg pack from one to two changes its line amount to PKR 3,700 and combined subtotal to PKR 4,520. |
| Quantity ceiling | Repeated increases stop at nine. Added disabled states to quantity buttons at their lower/upper boundaries. |
| Refresh persistence | Both pack selections survived a browser refresh. |
| Navigation persistence | Basket survived Product Detail → Signature and reopened with both packs. |
| Escape | Dismissed the native modal dialog. |
| Removal and empty state | Removing both test lines displayed the branded empty basket and shopping action. |
| WhatsApp link | Inspected generated link: correct configured business number, selected pack sizes and quantities. No external message was sent. |

Estimated totals remain hidden. Displayed prices are explicitly provisional. Existing journey, Fruit Intelligence and packaging animations were not modified by these fixes.

## Evidence

- [Desktop drawer](verification/basket/desktop-drawer.jpg)
- [Mobile sheet](verification/basket/mobile-sheet.jpg)

The screenshots show the actual application, not mockups. They were captured before the final removal test, so the test selection is visible. Automated model checks remain in `tests/basket.test.mjs`.

## Limits

This is browser-based responsive verification, not a physical-device or full accessibility certification. Reduced-motion CSS exists but was not independently emulated in this pass. No delivery, payment, inventory reservation or staff-confirmation system is claimed by this basket verification.
