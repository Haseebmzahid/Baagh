# BAAGH product audit and implementation roadmap

Audit date: 15 November 2026. Scope: the current working tree, including existing uncommitted commercial/catalogue changes. This document is a proposed next-stage plan; it does not replace the approved journey or Fruit Intelligence specifications.

> Progress update — 16 November 2026: durable basket, manual WhatsApp order
> requests, route loading boundaries and shopping photography have been
> implemented since this audit. The shopping navigation sprint closes category
> filtering links, unavailable-card enquiries and unknown-route recovery; see
> [verification](SHOPPING_NAVIGATION_VERIFICATION.md). Historical gap descriptions
> below describe the audit baseline. Backend phases remain deferred by the
> current frontend-only scope. The subsequent performance/information sprint
> adds per-fruit scene loading, adaptive rendering, lifecycle cleanup and public
> story/contact/policy/support pages; see
> [implementation and verification](PERFORMANCE_AND_INFORMATION_PAGES.md).
> Physical-device profiling and owner-confirmed operating/legal details remain
> launch gates. Signature corporate enquiry review remains future frontend work.

## 1. Product direction

Preserve the cinematic fruit journey and interactive inspection experiences. Complete the commerce and operating system around them. The next milestone should be a customer placing a real, serviceable order that staff can reliably prepare and deliver.

Serve two intents under one brand:

- **Everyday Fresh:** choose available food, understand pack and price, check delivery, buy quickly, reorder.
- **Signature:** choose a curated gift, understand its actual packaging and contents, personalize it, schedule delivery, buy or request a corporate quote.

Use one catalogue, inventory source, order system and delivery calendar. Keep distinct discovery and configuration flows for the two intents. Gift orders consume both food and packaging stock.

Working launch assumptions: one local operating area, one dispatch location, fixed-weight packs, guest checkout, curated gift options, and staff-managed last-mile delivery. Validate these before building rules around them. The repository is specifically a fruit brand; expanding into prepared food or other categories requires additional product, ingredient and handling requirements.

## 2. Audit evidence and limits

Reviewed application routing, brand configuration, commercial theme/primitives, catalogue/types/categories, product cards/detail/specimens, Signature/quote flow, journey setup, Fruit Intelligence shell/viewer/scenes, fallback logic, design and verification documentation, and commercial reference files.

`npm run build` passed TypeScript compilation and Vite production bundling. Output: main JavaScript 1,271.78 kB minified / 353.82 kB gzip; Vite reported a large-chunk warning. This is a transfer/build observation, not a measured runtime-performance score.

Local preview access through the browser timed out. No fresh screenshot comparison, touch-device assessment, accessibility conformance assessment, FPS benchmark or end-to-end order test was completed. Historical verification documents are useful references, not proof that the current working tree passes those checks.

No application source was changed during this audit. Existing uncommitted work was left intact.

## 3. Preserve the design contract

| Layer | Existing direction | Rule for subsequent work |
| --- | --- | --- |
| Brand journey | Nine stations in one continuous world, scroll-driven camera, fog, warm lighting, grain/vignette, restrained narrative cues | Preserve camera choreography, physical fruit geometry, station sequence and visual grade. Keep shopping sections outside this experience. |
| Fruit Intelligence | Dedicated inspection scenes for Chaunsa, Kinnow, Apple and Anaar; shared shell, annotations, drag interaction and fruit-specific anatomy | Preserve each fruit's mechanics and shared lifecycle. Link it to relevant products without forcing customers through the full lesson. |
| Everyday commerce | Warm dark canvas, editorial hierarchy, specimen plates, hairlines, subtle interaction | Extend the existing commercial primitives and tokens. Keep pack, price, availability and delivery readable. |
| Signature | Deeper canvas, slow hero drift and scroll-revealed presentation box | Reserve cinematic emphasis for presentation and packaging. Configuration and purchasing remain predictable. |
| Functional screens | The commercial theme already allocates L3 motion to basket, checkout and forms | Use restrained opacity transitions around 120 ms. Keep totals, fields and payment actions stable. |

### Visual invariants

- Journey/commercial palette: ink `#16150f`, paper `#f2ece0`, restrained gold `#e8cfa0`, dark desaturated leaf. Commercial gold is limited to state and emphasis, approximately five percent of a screen.
- Journey/commercial typography: Newsreader for meaning, IBM Plex Mono for factual labels. Fruit Intelligence intentionally uses Cormorant Garamond and Work Sans. Preserve these existing families as documented experience variants; do not silently impose either pairing everywhere.
- Maintain squared, approximately 2 px control corners and existing spacing/hierarchy. Use hairlines rather than adding heavy card borders.
- Architectural glass is limited to approved floating surfaces. The commercial contract excludes it from cart, checkout and forms. Existing `QuotePanel` uses shelf glass: reconcile that localized inconsistency when completing the form.
- Use existing motion levels: L1 cinematic presentation, L2 bounded interaction, L3 functional feedback. A 32-second Signature drift exists as an explicit variant despite a nearby theme comment referring to shorter loops.
- Preserve the default 3D experience. Provide usable reduced-motion and graphics-failure states, without making graphics support a requirement to purchase.
- Real product and packaging photography complements the procedural specimens: customers need to see what is actually delivered. Do not replace the existing cinematic world with stock photography.

Before later visual changes, capture baseline frames at every journey station, representative inspection acts, cabinet states and the three commercial pages at desktop/tablet/mobile sizes. Treat those as regression references.

## 4. Current maturity and launch gaps

| Area | Current evidence | Consequence / next action |
| --- | --- | --- |
| Brand experience | Journey, cabinet and four inspection experiences are implemented | Protect and benchmark them; further fruit scenes are lower priority than purchasing. |
| Catalogue | Typed products, packs, categories and collection references already exist | Retain the contract; introduce a repository/API boundary rather than duplicating product data in pages. |
| Product presentation | Product detail uses a live specimen renderer; image data and other plates remain provisional | Obtain actual fruit, pack and packaging assets. Preserve specimen integration. |
| Basket | `ProductDetail` calls `setAdded(true)`; `ProductCard` keeps quantity locally and offers an optional callback | No shared durable basket is implemented. The success label currently does not represent a persisted basket item. |
| Ordering | `whatsappNumber` is empty and `checkoutEnabled` is false in `catalogue.ts` | Neither purchase route is ready for launch. Configure the real contact and build persisted orders. |
| Corporate | Quote panel composes a WhatsApp message; its source explicitly says no backend/storage | Capture enquiries in the system, provide a reference, and let staff manage follow-up. |
| Operations | No application backend/database/order administration was found in this repository | Build the staff workflow alongside the customer order flow. Check for an existing external business system before creating competing records. |
| Delivery | Zones, slots, charges, stock and promises are deliberately unspecified | Obtain business rules before exposing delivery dates or accepting payment. |
| Graphics resilience | `AppContent` returns a global fallback before rendering the selected commercial route | Scope graphics fallbacks to their scene; keep catalogue, basket and checkout usable when WebGL is unavailable. |
| Navigation | Manual path/query/hash routing; story/corporate/order links have no dedicated handling; unknown paths default to journey | Establish explicit routes, meaningful missing-page behavior, anchor semantics, direct-load hosting support and route tests. |
| Performance | Eager scene/page imports; production output is one large application chunk | Introduce page/scene loading boundaries and measure CPU texture generation, memory, frame time and interaction latency. |
| Accessibility | Journey has focus-management infrastructure; FI shell controls pointer events using opacity without equivalent inactive-act focus gating | Test all states; make inactive FI content inaccessible to keyboard focus and expose the active narrative semantically. |
| Reduced motion | Hooks exist for journey/commercial; no equivalent preference handling was found in the FI shell/viewer/scenes inspected | Implement consistent preference behavior across the inspection scenes and DOM cues, preserving the approved default choreography. |
| Mobile header | Existing `HEADER_TAP_TARGET_ISSUES.md` reports 21/39/26 px heights | Re-measure and enlarge invisible hit areas to the project's 44 px target without changing visual weight. Do not treat the historical document as a fresh measurement. |
| Search/content | Single static page title and no complete route metadata/content delivery strategy | Add route metadata, discoverable product text, canonical URLs, social previews and appropriate indexing rules. |
| Verification | Build command exists; no dedicated automated test suite was found | Add meaningful tests for the new commerce rules and critical navigation/payment journeys. |

The catalogue contains a mixture of clearly marked placeholders and specific factual claims. Verify origin, heritage, ripening, picking, quality and handling claims with the owner; provisional flags alone do not establish their accuracy. Availability is currently editorial/static and must not be treated as live stock. Month windows are indicative seasonality, not inventory or delivery promises.

## 5. Business decisions that shape implementation

Capture these in an owner-approved operating brief. Work on reversible interface foundations can proceed while answers are collected; live prices, delivery commitments and payment configuration depend on them.

1. **Market and identity:** launch country/city, currency, business name, verified history and contact details. Current code says Pakistan/PKR. The brief mentions an Indian expert, which does not by itself establish an Indian launch market.
2. **Delivery:** exact service areas, address validation method, opening days, cutoffs, lead times, slot capacity, fees, minimum basket, pickup and failed-delivery handling. Use the business timezone, not the shopper device clock.
3. **Catalogue:** initial orderable products, pack weights/count tolerances, real prices, seasonal supply, stock update ownership and acceptable substitutions.
4. **Gifts:** physical box sizes/materials, food contents, packaging cost and supply, personalization limits, preparation time, recipient contact rules and receipt handling.
5. **Payments:** accepted methods, merchant eligibility, settlement/refund process and whether staff acceptance is required before a promise is final. Select the provider after market and business-account eligibility are confirmed.
6. **Customer support:** freshness complaint process, evidence requirements, cancellation boundaries, refund/replacement authority and actual support response capacity.
7. **Operations:** who maintains stock, accepts orders, packs, dispatches, marks delivery and reconciles money; whether an existing POS/ledger is authoritative.

## 6. Target journeys and information architecture

### Everyday Fresh

Direct shop entry or journey CTA → available collection → product/pack/quantity → basket → serviceable address → delivery slot → server-priced review → payment or approved manual method → order reference/status → staff preparation and delivery → optional reorder.

Allow an early area check; calculate fees and slot eligibility again from the full delivery address. Do not require an account or a full cinematic scroll to shop. Preserve basket contents during Fruit Intelligence visits, route changes and refreshes. Revalidate them on return and before purchase.

### Signature retail

Signature collection → gift detail with actual contents, packaging and price → allowed box/contents option → gift message and recipient → serviceability/date → basket/review → payment → confirmation and status.

Start with curated fixed compositions. Make substitution consent explicit. A fully free-form hamper builder can wait until packaging fit, component inventory and staff capacity are proven. Keep sender billing/contact details separate from recipient delivery details. Use a gift receipt treatment without removing required sender records.

### Corporate

Corporate page → quantity, budget, date, destinations and branding brief → saved enquiry reference → staff quote → versioned customer approval → agreed payment → preparation → delivery tracking. Start with staff-assisted multi-address fulfilment; automate bulk imports later.

### Proposed routes

Retain `/`, `/everyday-fresh`, `/product/:category/:slug`, `/signature` and `/fruit-intelligence/:fruit`. Add `/basket`, `/checkout`, `/orders/:publicReference`, `/signature/:giftSlug`, `/corporate`, `/our-story`, `/delivery`, `/help` and policy routes. Preserve existing product aliases via canonical routing. Keep order pages private and out of search indexing; a public reference alone must not grant access to personal information.

Customer accounts, loyalty, subscriptions, advanced search, a delivery app and extra 3D scenes are later additions. A small launch catalogue needs useful availability/category filters before sophisticated search.

## 7. Backend architecture

### Proposed shape

Keep React/Vite and the existing Three.js/R3F experiences. Add a typed server API, a managed PostgreSQL database, asset storage/CDN, a small protected admin interface, and a background worker for notifications, reservation expiry and reconciliation. Deploy the API and worker from one modular backend codebase initially.

This is an architectural proposal, not a provider procurement decision. Reassess against any existing POS/commerce platform before final selection. Avoid a frontend framework rewrite solely to add orders. For search-facing catalogue pages, evaluate prerendering or server rendering at a contained boundary after confirming content/indexing requirements.

Suggested modules: catalogue, pricing, inventory, delivery, cart/quote, orders, payments, gifting, corporate enquiries, notifications, admin/audit. Keep commerce types independent of UI modules: `src/data/types.ts` currently imports `ProductState` from the commercial theme; presentation state should be derived from domain availability at the UI boundary.

### Core records

| Domain | Records / important fields |
| --- | --- |
| Catalogue | Product, SKU/pack, media, curated collection, publication status, verified claims, currency and integer minor-unit prices |
| Supply | Inventory lot/batch, received quantity, usable quantity, spoilage/adjustments, quality status, reservation, allocation and stock movement |
| Delivery | Zone, service calendar, slot, cutoff, capacity, fee rule and reservation |
| Gifts | Packaging SKU and stock, composition/version, component quantities, capacity constraint, preparation lead time, personalization |
| Basket/quote | Anonymous cart, line configuration, server-priced quote, expiry and revision |
| Orders | Order, immutable line/price/address snapshots, payment status, fulfilment status, history, substitution consent and source channel |
| Money | Payment attempt, provider reference, processed event, refund, reconciliation state |
| Corporate | Enquiry, staff owner, quote/version, approval and linked orders |
| Staff | Authenticated staff identity, permissions and audit event |

For V1, sell fixed packs using exact available units; derive these from a controlled packing allocation or a batch ledger without counting the same fruit twice. If variable-weight selling is required, define estimation, weighing, adjustment and customer approval before implementing its payment flow. Track packaging separately. Expiry/quality and dispatch suitability determine usable stock; calendar season alone cannot do this.

### Server-owned purchase rules

1. Client submits SKU/configuration IDs and quantities, never authoritative prices, discounts or availability.
2. Server calculates quote and validates active products, packing constraints, usable stock, zone, date, cutoff, capacity and fees. Store quote revision/expiry.
3. An idempotent order request atomically reserves food, packaging and delivery capacity and saves an order snapshot. Acquire locks consistently and retry safe transient conflicts. PostgreSQL row locks provide an appropriate primitive, not a complete overselling solution by themselves: [official locking documentation](https://www.postgresql.org/docs/current/explicit-locking.html).
4. Create a payment session through an adapter using the saved amount/currency. Do not hold a database transaction open during external payment calls.
5. Verify provider notifications, deduplicate events and apply allowed state changes transactionally. A browser redirect never proves payment. Stripe documents signature verification, duplicate deliveries and unordered events; use the selected provider's equivalent contract: [webhook documentation](https://docs.stripe.com/webhooks). This is a reliability reference, not a recommendation to use Stripe in the unconfirmed market.
6. Expire unpaid reservations, safely release capacity, and reconcile payment attempts. Define a late-payment path: reacquire stock/capacity or flag an exception for prompt refund/customer resolution. Never silently fulfil an unserviceable paid order.
7. Save notifications in an outbox alongside order transitions; a worker sends/retries them. Notification failure must not undo an already-saved order.
8. Staff acceptance, packing, dispatch, delivery, cancellation and refunds remain auditable. Cancellation releases only resources that are still reserved; dispatched/spoiled goods follow explicit adjustment rules.

Keep payment and fulfilment states separate. Example fulfilment lifecycle: received → accepted → packing → ready → dispatched → delivered, with controlled rejection/cancellation/exception paths. Example payment lifecycle: unpaid → pending → paid → partially refunded/refunded, with failure states. Manual/COD methods, if approved, need explicit confirmation and reconciliation; they must not masquerade as online payment success.

### API outline

- `GET /api/catalogue` and `GET /api/products/:id`: published product views.
- `POST /api/serviceability`: supported area and delivery constraints.
- `POST /api/quotes`: validated totals and eligible options for basket/address/date.
- `POST /api/orders`: idempotent purchase request referencing a current quote.
- `POST /api/orders/:id/payment-session`: provider-neutral payment initiation.
- `POST /api/payments/:provider/webhook`: verified asynchronous payment updates.
- `GET /api/orders/:reference`: narrowly authorized customer status view.
- `POST /api/corporate-enquiries`: validated, persisted lead plus reference.
- Protected staff endpoints: catalogue/stock/calendar management, orders, controlled state transitions, refunds and quotes.

Exact contracts follow the operating brief. Validate inputs at runtime; TypeScript alone does not validate requests. Keep database/payment credentials on the server. Protect staff access and customer order reads, rate-limit abuse-prone endpoints, redact personal data from logs, and define retention/backups and a restore drill.

### WhatsApp's role

Retain WhatsApp as a familiar support/assisted-order route. Opening a prepared message is not confirmation that it was sent, accepted or paid. Staff must record accepted WhatsApp orders in the same order system so online stock and delivery capacity stay correct. Any later automated outbound messaging requires an explicit product decision, supported integration and appropriate customer preferences.

## 8. Phased delivery plan

Indicative effort assumes one experienced full-stack engineer, part-time design/QA and prompt owner decisions/assets. These are planning ranges, not delivery commitments. Provider onboarding, photography and unresolved operations can extend elapsed time. Phases 0–6 total roughly 12–18 engineering weeks; some content and asset work can overlap.

| Phase | Estimate | Deliverables | Exit condition |
| --- | --- | --- | --- |
| 0 — Confirm rules and protect design | 3–5 days | Operating brief; verified launch catalogue; visual baseline; route map; agreed gift offering and owner decisions | Market, service area, purchase rules and non-negotiable design references are explicit. |
| 1 — Durable basket and reliable navigation | 1–2 weeks | Shared basket across cards/detail; refresh persistence; basket page; empty/error/unavailable states; selected-pack identity; explicit route handling; scene-scoped fallbacks; initial loading boundaries | A customer builds, changes and resumes a basket across routes/refreshes, including without WebGL. Totals are indicative until server quote exists. |
| 2 — Commerce backend and staff foundation | 2–3 weeks | Schema/migrations; catalogue adapter; stock/packaging ledger; zones/slots; server quotes; persisted orders; protected stock/calendar/order dashboard | Staff can maintain a small real catalogue and process a test order; concurrent stock/slot requests cannot oversell. |
| 3 — Complete Everyday ordering | 2–3 weeks | Guest checkout; address/serviceability; slots; selected payment/manual method; reliable callbacks; confirmation/status; cancellation/refund workflow; saved assisted orders | A customer order can be paid or correctly recorded by method, packed, dispatched and reconciled; failures recover without duplicate charges/orders. |
| 4 — Complete Signature retail and corporate enquiries | 2–3 weeks | Gift detail, real packaging assets, curated composition, gift note/recipient/date, food plus packaging reservations; saved corporate enquiries and staff quotes | A paid gift retains all configuration and recipient data through the packing sheet; corporate requests are traceable. |
| 5 — Content, discovery and production QA | 1–2 weeks | Verified story/claims; actual product/packaging photography; delivery/help/policies; route metadata and product discovery; accessibility, motion, device and performance fixes; funnel/error monitoring | Required launch content is accurate; critical paths pass keyboard/touch/graphics-failure checks; visual regression and operational tests pass. Begin these checks in earlier phases too. |
| 6 — Controlled local pilot | About 2 weeks | Restricted geography and daily capacity; real staff rehearsals and monitored orders; payment reconciliation; support/quality feedback; restore/rollback rehearsal | Business owner accepts service quality and reconciliation; only then expand capacity and area. |

A narrower assisted-order pilot can launch earlier after phases 0–2 if the owner approves manual acceptance/payment handling. It still requires persisted orders, stock/capacity controls, honest confirmation language and staff reconciliation. Full self-service remains the target.

## 9. The next implementation sprint

Build the durable basket and route/fallback foundation first, while collecting business inputs. Do not start by adding another cinematic section.

1. Define basket line identity as SKU/pack + configuration, with quantity limits and versioned persistence. Persist non-sensitive selection data only; prices remain display snapshots until revalidated.
2. Introduce a shared cart domain/provider and catalogue repository boundary. Wire card quantities and both product-detail add actions to the same state.
3. Add `/basket` using existing commercial typography, canvas and hairline components. Include edit/remove, clear feedback, empty state and availability-change treatment. Do not display a false order-success state.
4. Add a route-aware basket entry/count in the existing commercial navigation treatment. Verify the journey/cabinet composition before touching shared chrome.
5. Limit graphics errors to the journey/specimen/inspection that failed. Preserve shopping routes and basket even when graphics cannot initialize.
6. Establish canonical routes, unknown-route behavior and working category anchors; reset product selection state when changing product identity.
7. Begin route/scene lazy loading; measure initial and navigated costs because shared specimen imports may still bring multiple fruit engines into a chunk.
8. Add targeted tests: merge identical packs, distinguish different packs/options, reject invalid quantities, recover corrupted persistence, retain basket across navigation/reload, and buy-flow access without WebGL. Capture visual baselines before changing rendering behavior.

Sprint completion is a functional basket with truthful UI and preserved visual identity. Payment integration follows server quoting and stock/delivery rules.

## 10. Verification and launch gates

### Commerce correctness

- Last available pack requested concurrently by two buyers: at most one reservation succeeds. Repeat for packaging and delivery-slot capacity.
- Tampered browser price, expired quote, changed fee or unavailable pack: server rejects/requotes with clear customer recovery.
- Double-click, request retry, duplicate webhook and out-of-order provider event: one intended order/payment transition.
- Abandoned payment, provider timeout, browser close, delayed success after reservation expiry and refund failure: explicit recoverable states and staff visibility.
- Mixed everyday/gift basket: calculate compatible delivery and lead times. V1 can require separate orders for incompatible dates rather than silently splitting fulfilment.
- Gift message/contents survive into the staff packing view; recipient-facing output uses the intended gift-receipt treatment.
- WhatsApp/manual orders consume the same inventory and slot capacity.

### Experience and reliability

- Refresh/back/forward/direct-load checks on canonical routes and aliases; real missing-page handling.
- Graphics disabled/context lost: catalogue, basket, address, payment and order status remain usable.
- Keyboard focus, inactive narrative acts, touch targets, form labels/errors, announcement of basket updates, contrast and reduced motion are checked across experiences.
- Compare fixed baseline frames to protect camera paths, fruit geometry, lighting, typography and packaging motion.
- Measure representative low/mid-range mobile devices and slower networks. Track loading, main-thread texture generation, interaction latency, frame-time stability and memory over repeated scene navigation. Review perpetual render loops, `preserveDrawingBuffer`, geometry/material disposal and tab/offscreen suspension before optimizing them.
- Target field p75 LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 for commerce pages, using lab checks before enough real traffic exists. These are targets, not current measurements; [Google's Web Vitals guidance](https://web.dev/articles/vitals) defines the thresholds. Canvas readiness and frame pacing need separate measures.
- Verify published-product metadata, canonical URLs, social previews, crawlable content, sitemap and private-order exclusion. Structured product data must reflect genuine price/availability.
- Separate staging/production credentials; verified staff roles; logs without sensitive fields; error alerts; database restore and deployment rollback rehearsals.

### Business success measures

Instrument intent selection, product views, pack choice, add/remove, serviceability result, checkout start, payment result, confirmed orders and gift/corporate funnel stages. Treat WhatsApp opens as assisted-intent events, not purchases. Keep addresses, phone numbers and gift notes out of analytics payloads.

Measure conversion separately for Everyday and Signature, payment failures, unsupported-area exits, on-time fulfilment, complaints/refunds, repeat orders and contribution margin after food, packaging, payment fees, spoilage and delivery. Establish baselines in the pilot before inventing conversion targets. Gate expansion on operational performance as well as sales.

## 11. Later work, driven by evidence

After the pilot proves reliable fulfilment: frictionless reorder, optional customer accounts, festival gift runs supported by actual operations, corporate multi-address import, approved substitutions, smarter search, subscriptions and loyalty. Add further fruit experiences when they support actual stocked products and have a measurable education or conversion purpose.

Do not begin with microservices, a complete storefront rewrite, a free-form 3D hamper builder, AI product advice or broad geographic expansion. The existing design already supplies differentiation; dependable purchasing and delivery make it a business.

## 12. Repository anchors

- Brand/journey contract: `docs/Design.md`, `src/config/brand.ts`, `src/config/tokens.ts`, `src/config/cameraKeyframes.ts`.
- Commercial contract: `src/components/commercial/theme.ts`, `primitives.tsx`, and `Design prototype/commercial/`.
- Existing catalogue: `src/data/catalogue.ts`, `types.ts`, `categories.ts`.
- Current purchase interactions: `src/components/commercial/ProductDetail.tsx`, `ProductCard.tsx`, `Signature.tsx`.
- Routing/global fallback: `src/App.tsx`; local specimen fallback: `src/components/commercial/ProductSpecimen.tsx`.
- Fruit Intelligence: `docs/FRUIT_INTELLIGENCE_ARCHITECTURE.md`, `src/components/fruit-intelligence/`.
- Historical mobile findings: `docs/HEADER_TAP_TARGET_ISSUES.md`.
