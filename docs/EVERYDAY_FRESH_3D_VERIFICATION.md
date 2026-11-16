# Everyday Fresh — commercial 3D foundation

Implemented and verified locally on 16 November 2026. Scope: Everyday Fresh's presentation, shared commercial rendering, and supporting navigation/loading resilience. Signature's packaging redesign is the next separate step.

## Design and behaviour

- Preserves BAAGH's Newsreader / IBM Plex Mono pairing, warm ink canvas, paper text, restrained gold, squared controls and editorial spacing.
- Introduces a product-led hero: “Everyday. Exceptional.”, a live fruit still life, native product links, a direct catalogue link and a visible Signature entry point.
- Four selectable studies reuse the existing Chaunsa, Kinnow, Apple and Anaar geometry and procedural skin materials. The original Fruit Intelligence scenes and nine-station journey files are unchanged.
- Fruit rests on a bevelled stone display with warm studio lighting, contact shadows, small pointer response and restrained idle/scroll movement. Native page scrolling remains available throughout.
- Selection updates the model, product name, origin, availability, pack/price caption, product destination and Fruit Intelligence destination together. Unavailable studies show their catalogue status instead of a purchase price.
- One renderer creates the live hero and captures one portrait per fruit for reuse in categories, the featured selection, product cards and curated cards. Portraits live in memory for the page visit; cards do not create independent WebGL contexts.
- Mobile places the fruit display directly after the headline. The selector becomes a two-column control group. Desktop and tablet retain the editorial two-column composition.
- Motion can be paused/resumed. The new stage respects reduced motion, suspends its live loop when offscreen or the tab is hidden, and disposes its textures, geometry, shadow resources, observers and listeners on unmount. Texture generation for the display is bounded to 1024 px; the original full inspection scenes keep their existing detail.

## Supporting engineering changes

- Routes resolve before the first render, preventing a direct shop visit from mounting the cinematic journey first.
- Journey, Fruit Intelligence, Signature, product detail, cabinet and specimen engines load through separate boundaries. The initial DOM shopping interface no longer imports the full Three.js scene graph eagerly.
- The global graphics fallback is limited to the journey. Commercial pages remain DOM shopping surfaces while individual graphics use their own fallback. The cabinet also catches unsupported-renderer initialization.
- WebGL capability probing is cached; its disposable probe context is released.
- Commercial header links use canonical paths. Legacy hash routes remain supported, including Fruit Intelligence's `#signature-collection` destination. Compact navigation is used on tablet as well as phone to avoid crowding.
- Added `vercel.json` SPA rewrites for direct nested-route requests, excluding the asset directory. This configuration still needs verification after deployment on Vercel.
- No database, payment, order persistence or customer-information storage was introduced. Existing basket and WhatsApp request logic remains intact.

## Verification

`npm test`: all 26 checks passed, including five navigation/registry tests plus the existing 21 basket/request checks.

`npm run build`: passed TypeScript and Vite production compilation. Final output:

| Asset | Minified | Gzip |
| --- | --- | --- |
| Initial application JavaScript | 242.28 kB | 75.12 kB |
| Deferred Three.js module | 732.13 kB | 189.58 kB |
| Deferred Fruit Intelligence | 72.46 kB | 23.75 kB |
| Deferred journey | 162.62 kB | 50.75 kB |

The previous verified initial app bundle was 1,292.13 kB / 360.92 kB gzip. This is a code-splitting observation, not a claim that the complete 3D experience transfers 81% less data or loads 81% faster. The large Three.js chunk warning remains. Field Core Web Vitals, frame-rate benchmarks and physical-device performance have not been established.

### Browser observations

Verified the actual local application in the in-app browser:

| Check | Result |
| --- | --- |
| Desktop, 1440 × 1000 | Hero, still life, captions, controls and selection rail render correctly. |
| Tablet, 820 × 1180 | Two-column composition fits; compact navigation avoids overflow. |
| Phone, 375 × 812 | Product-first composition, portrait layout and shopping actions remain accessible. |
| Narrow phone, 320 × 780 | No horizontal document overflow; title and fruit display fit. |
| Shared rendering | Observed one canvas with basket/cabinet closed and 14 reused portrait images after generation. |
| Fruit selection | Apple switches the study and shows “Coming soon”; Anaar switches the product destination and price. |
| Pause control | Pause changes to Resume and the stage reports a still-life study. |
| Product purchase path | Anaar → product detail → add pack opened the basket with the expected additional line and subtotal. The test addition was removed afterward. |
| Signature entry | “Discover Signature” opened the existing Signature page. |
| Fruit Intelligence entry | Existing Chaunsa inspection loaded through its lazy boundary without console errors. |
| Browser errors | No application errors observed during the rendering/navigation checks. |

Illustration fallback and reduced-motion handling were reviewed in source; hardware context loss and the OS reduced-motion preference were not independently emulated in this browser pass. This is not a full accessibility certification. No external WhatsApp message was sent.

## Visual evidence

- [Desktop hero](verification/everyday-fresh/desktop-hero.jpg)
- [Mobile hero](verification/everyday-fresh/mobile-hero.jpg)
- [Product portraits](verification/everyday-fresh/product-grid.jpg)

Product prices, availability and some editorial claims are still supplied by the provisional catalogue. Rendered fruit studies are illustrations, not photographs or guarantees of exact delivered appearance. Real packaging references and dimensions will guide the later Signature work.

## Main files

- `src/components/commercial/EverydayShowcase.tsx`: composition, product selection and destinations.
- `src/components/commercial/CommerceStage.tsx`: React scene lifecycle and motion control.
- `src/components/commercial/commerceStageScene.ts`: shared rendering, resource management and portraits.
- `src/components/commercial/everydayShowcase.css`: responsive layout and presentation.
- `src/navigation/route.ts`: initial and legacy route resolution.
- `tests/navigation.test.mjs`: navigation and lightweight specimen lookup checks.
