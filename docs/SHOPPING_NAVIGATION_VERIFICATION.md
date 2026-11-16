# Shopping navigation sprint — 16 November 2026

## Scope and roadmap position

Completes remaining frontend discovery/navigation items from phase 1 in
PRODUCT_AUDIT_AND_ROADMAP.md. Basket persistence and the manual WhatsApp request
flow already exist. The subsequent backend, payments, inventory and staff
phases remain deferred under the current frontend-only brief.

## Changes

- Everyday Fresh category tiles now select the corresponding catalogue filter.
  Filter chips update the same URL hash, so reloads and Back/Forward restore the
  selection. “Everything” clears the filter. Fruit Boxes and Family lead to the
  existing box section instead of an unrelated unfiltered fruit grid.
- A polite live result count exposes filter changes to assistive technology.
- Unavailable product cards offer “Ask availability” with a product-specific
  WhatsApp draft. No subscription, stock promise or message delivery is implied.
- Unknown routes display a DOM recovery page with shop and basket destinations.
  Malformed Fruit Intelligence paths no longer silently open a valid scene.
- Existing fruit photographs, Chaunsa orchard image, basket state and cinematic
  scene sources remain unchanged.

## Automated verification

- `npm test`: 28 tests pass, including existing basket/request tests and added
  category destination and unknown-route cases.
- `npm run build`: passes TypeScript and Vite production bundling. Initial JS
  approximately 238.61 kB minified; the existing shared Three.js chunk still
  produces Vite's large-chunk warning.
- `git diff --check`: passes.

## Limits

Browser visual verification was attempted against the running Vite preview at
`http://127.0.0.1:3002/everyday-fresh#citrus`, but the in-app browser returned
`net::ERR_CONNECTION_TIMED_OUT`. No fresh screenshots were captured.
Automated domain tests do not prove
rendered mobile geometry, keyboard navigation, scroll positioning or browser
history behavior. No WhatsApp message has been sent. The missing-page treatment
is client-side; the SPA hosting rewrite still serves HTTP 200 and needs separate
server/indexing work before claiming HTTP 404 semantics. Product-detail missing
products retain their existing recovery treatment.

## Next frontend sprint

Signature enquiry review and form accessibility: complete the existing
staff-assisted corporate request with clear required inputs, in-memory review
and honest WhatsApp handoff. Real packaging specifications and live commerce
rules still require owner confirmation before expanding gifting configuration.
