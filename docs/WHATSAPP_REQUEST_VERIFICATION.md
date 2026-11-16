# WhatsApp order-request handoff

Implemented and verified on 15 November 2026. Scope: a delivery-details and message-review step from the basket drawer and `/basket` review page. This is a customer-sent WhatsApp request, with no database, payment processing or order-management integration.

## Behaviour

1. Continue to WhatsApp opens a local form rather than navigating externally.
2. Customer name, contact number and delivery address are required. The order note is optional. The contact number can differ from the customer's WhatsApp account number.
3. Review WhatsApp message validates the fields and displays the exact message that will be passed to WhatsApp.
4. The message includes product names, selected packs, quantities, displayed unit and line prices, item subtotal, delivery details and an optional note. Provisional prices are labelled as estimates. Delivery fees and an estimated final total are not invented.
5. The request and message both state that final prices, delivery fees, availability and delivery timing require BAAGH staff confirmation. There is no order-confirmed screen or generated order reference.
6. Open WhatsApp to review & send opens the configured business link in a separate tab. The customer must manually send the prefilled message. Opening the link does not clear the basket or claim that anything was sent.

## Privacy boundary

Delivery fields and the generated preview are held only in the mounted `WhatsAppRequest` component's React state. They are not passed into persisted basket selections, localStorage, sessionStorage, IndexedDB, database calls, logs or analytics. Form autocomplete is disabled. A short privacy note explains that details are included in the message the customer chooses to send.

Closing the drawer, leaving the details step, navigating away or refreshing discards these fields. Returning from preview to edit preserves them within the same mounted step. The basket itself continues to persist product/pack IDs and quantities independently.

## Automated checks

`npm test` covers the existing nine basket checks plus eight request checks:

- Missing required fields and whitespace-only input.
- Local and international contact formats, independent of the destination number.
- Field-length validation.
- Exact packs, quantities, unit estimates, line estimates and subtotal.
- Required staff-confirmation wording and absence of a fabricated final total.
- Optional notes and non-provisional displayed prices.
- Invalid/empty requests and invalid quantities/prices.
- Unicode/punctuation URL encoding and decimal currency formatting.

Phase 1 now has a small service boundary in `src/basket/orderingService.ts`.
`prepareOrderRequest(input)` returns either field errors or the prepared message
and WhatsApp URL. It has no storage, network or order-confirmation side effects.
The delivery component calls this service instead of assembling the handoff.
Four additional service tests cover the exact URL/message contract, invalid
input, invalid destination/currency, and isolation of customer details between
calls. Total automated checks: 21.

Final Phase 1 check: all 21 tests passed and the production build passed. The
browser flow was rechecked through the service: field errors focus the first
invalid input, decoded handoff text exactly matches the preview, the destination
is the configured BAAGH number, and personal fields clear after leaving the
step. No WhatsApp message was sent. The final mobile screenshot is
`verification/whatsapp-request/phase-one-handoff.jpg` (fictional sample data).

No PostgreSQL dependency, server configuration, API proxy or database schema is
part of this phase. The proposed backend scaffold was removed after the scope
was clarified; no database was configured or migrated.

## Browser verification

Verified the running local application in an isolated in-app browser using fictional test details. No external WhatsApp link was opened and no message was sent.

| Check | Observed result |
| --- | --- |
| Empty form submission | Inline errors appear and focus moves to the first invalid field. |
| Preview generation | Products, pack, quantity, estimates, delivery details, note and disclaimers match the requested format. |
| Generated link | Decoded `text` parameter exactly matches the visible preview; destination is the configured BAAGH number. |
| Edit details | Values remain available while editing within the step. |
| Change basket in another tab | Old preview is removed; customer is asked to review again before generating an updated message. |
| Close and reopen drawer | All four personal-data fields are empty; basket remains available. |
| Refresh after entering details | All personal-data fields are empty; basket still has its saved packs. |
| Back to basket | Personal-data component unmounts and keyboard focus returns inside the drawer or to the review-page heading. |
| Desktop, 1440 × 900 | Drawer and full-page review use the existing BAAGH colours and typography. |
| Portrait mobile, 375 × 812 | Form and preview fit the sheet width; fields, notices and actions are reachable by scrolling. |
| Landscape mobile, 667 × 375 | Entire sheet scrolls; WhatsApp, edit and back actions remain reachable. |

No journey, Fruit Intelligence or specimen scene was changed. The existing large JavaScript bundle warning remains outside this task's scope. This browser verification does not establish physical-device or full accessibility conformance, and the external WhatsApp application/send step was intentionally not exercised.

## Evidence

Screenshots contain fictional example details only:

- [Mobile delivery form](verification/whatsapp-request/mobile-details.jpg)
- [Mobile message review and handoff](verification/whatsapp-request/mobile-review.jpg)
- [Desktop full-page review](verification/whatsapp-request/desktop-review.jpg)

Implementation: `src/basket/orderRequest.ts`, `src/components/commercial/WhatsAppRequest.tsx`, `src/components/commercial/whatsappRequest.css`, and the entry points in `src/components/commercial/Basket.tsx`.
