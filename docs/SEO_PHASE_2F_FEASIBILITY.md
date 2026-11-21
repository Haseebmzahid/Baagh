# BAAGH SEO Phase 2F — Unknown URL handling

Audit date 20 November 2026. Repository baseline `f3317a7`. Production still returns **HTTP 200 with a noindex SPA shell** for genuinely missing page paths. The smallest viable fix is to preserve the existing explicit route mappings, protect the valid variants currently reached through the SPA fallback, and let Vercel own the final 404 response. A generated static `404.html` can supply the error body.

## Existing routing

- Phase 1 documented the original broad SPA rewrite. Phase 2 retained the 200/noindex fallback. Phases 2B Batch 1B and 2C Batch 1B brought the prerender allowlist to eight canonical bodies. This audit used those records, the checked-in source and Vercel configuration, the existing `dist`, and fresh production requests.
- `src/seo/pages.ts` builds 19 canonical entries from the application, catalogue, fruit studies and information registry. It also lists 14 aliases. `scripts/build-seo.mjs` emits an HTML document per canonical and alias, plus basket and `spa.html`. All 34 legitimate entry paths have explicit rewrites in `vercel.json`. The last rewrite sends other matching paths to `spa.html`, with exclusions for asset and image subpaths and the four generated crawler/manifest files. The project uses the Vite static output in `dist` after `npm run build`. The checked-in configuration sets `trailingSlash: false` and defines no explicit moved-page redirects.
- `src/navigation/route.ts` lowercases paths, trims trailing slashes and resolves recognized fragments before pathname rules. Product patterns identify candidates. `getProduct` in the catalogue determines whether the category and slug exist, and `ProductDetail` renders its missing-product state when the lookup fails. Fruit Intelligence has four valid slugs and a default study alias. Information aliases use `src/data/sitePageRegistry.ts`.
- `src/main.tsx` hydrates a valid prerender snapshot or mounts React into an empty root. `src/App.tsx` handles history and fragment navigation, updates metadata and renders the appropriate view, including the existing React not-found state. Client-side routing can change the rendered view and head after the response status has already been sent.
- The error shell contains an empty React root, the application entry code and the title `Page not found | BAAGH`. It declares `noindex, follow` and has no canonical. The local static SEO checker passed for the existing output, including the eight prerender markers. It verifies generated markup and mappings but makes no HTTP requests.

## Valid requests

Every path in this table returned **200** with no `Location` header in both production and local Vite preview. Canonical documents had self-canonicals and indexable robots metadata. “Shell” means the initial HTML has an empty React root and metadata. Alias shells carry the canonical of the target, and basket carries its own canonical and `noindex, follow`.

| Coverage | Paths and initial content |
| --- | --- |
| Eight prerendered canonical pages | `/everyday-fresh`, `/signature`, `/our-story`, `/product/mangoes/chaunsa`, `/fruit-intelligence/chaunsa`, `/fruit-intelligence/kinnow`, `/fruit-intelligence/apple`, `/fruit-intelligence/anaar`. Each returned a populated root and bootstrap marker. |
| Eleven other canonical pages | `/`, `/product/citrus/kinnow`, `/product/apples/apple`, `/product/seasonal/anaar`, `/contact`, `/privacy-policy`, `/cookies`, `/terms`, `/delivery`, `/returns`, `/help`. Each returned its own metadata shell. |
| Information aliases | `/about` and `/about-us` → `/our-story`, `/contact-us` → `/contact`, `/privacy` → `/privacy-policy`, `/cookie-policy` → `/cookies`, `/terms-and-conditions` → `/terms`, `/faq` → `/help`, `/shipping-policy` → `/delivery`, `/refund-policy` → `/returns`. Arrows indicate canonical targets. |
| Study and product aliases | `/fruit-intelligence` → `/fruit-intelligence/chaunsa`. `/everyday-fresh/mangoes/chaunsa`, `/everyday-fresh/citrus/kinnow`, `/everyday-fresh/apples/apple` and `/everyday-fresh/seasonal/anaar` canonicalize to the corresponding `/product/` URLs. |
| Application | `/basket` returned the basket shell. |
| Crawler resources | `/robots.txt`, `/sitemap.xml`, `/llms.txt` and `/seo-manifest.json` returned 200 with plain text, XML, plain text and JSON respectively. |

| Variant tested | Production first response | Local Vite preview |
| --- | --- | --- |
| `/?fruit=apple`, `/?fruit=kinnow#kinnow` | 200 homepage shell | Same. Chrome displayed the Apple study for `/?fruit=apple&fallback=true`. |
| `/#story`, `/#journey`, `/#signature-collection`, `/#basket`, `/#order`, `/#fruit-intelligence`, `/#anaar` | 200 homepage shell because fragments stay in the browser | Same. The resolver also supports `#everyday-fresh`, `#signature` and all four fruit fragments. |
| `/everyday-fresh#boxes`, `/everyday-fresh#ready-today` | 200 collection prerender | Same. Collection category fragments and `#family` are also handled by the client. |
| `/fruit-intelligence/apple?fallback=true` | 200 Apple study prerender | Same |
| `/product/mangoes/chaunsa/?utm_source=audit`, `/about-us/` | 308 to the slashless URL, retaining the query where present | 200 with the corresponding document directly |
| `/PRODUCT/MANGOES/CHAUNSA` | 200 with the error shell | Same initial response. Chrome rendered Chaunsa and applied its correct SEO head after mount. This path is a valid resolver variant. |
| `/fruit-intelligence//apple` | 308 to `/fruit-intelligence/apple` | 200 with the error shell. Chrome rendered Apple with `?fallback=true`. |
| `/__phase2f-missing#basket` | 200 with the error shell for the missing pathname | Same initial response. Chrome rendered the basket because the resolver gives recognized fragments precedence. See the compatibility decision below. |

## Missing URL measurements

Measurements used GET with `Accept: text/html` and automatic redirects disabled so the first status and `Location` were visible. The local server used the repository's Vite preview middleware and existing build output. It applies the checked-in mappings but does not implement Vercel edge normalization and can fall through to Vite's own SPA handler. Vercel CLI was unavailable locally. Production supplied the edge measurements.

In the following table, **SPA** means a 200 HTML response with the not-found title, empty `#root`, `noindex, follow` meta, no `X-Robots-Tag`, no canonical and no `Location`. Local responses matched `dist/spa.html` byte for byte. Production had the same identifying markup and no redirect for direct SPA responses, consistent with the configured internal rewrite. Headless Chrome with JavaScript disabled observed a final HTTP 200, one empty root and zero visible body text for every row in both environments. In production the browser followed the trailing-slash redirect.

| Request | Production | Local preview | JavaScript disabled on both |
| --- | --- | --- | --- |
| `/__phase2f-missing` | SPA | SPA | Blank |
| `/__phase2f-missing-2` | SPA | SPA | Blank |
| `/product/mangoes/__phase2f-missing` | SPA | SPA | Blank |
| `/everyday-fresh/mangoes/__phase2f-missing` | SPA | SPA | Blank |
| `/fruit-intelligence/__phase2f-missing` | SPA | SPA | Blank |
| `/fruit-intelligence/chaunsa/extra` | SPA | SPA | Blank |
| `/nested/no/such/page` | SPA | SPA | Blank |
| `/__phase2f-missing?fruit=apple` | SPA | SPA | Blank |
| `/__phase2f-missing/` | 308 to `/__phase2f-missing`, whose direct GET returns SPA | SPA | Blank |

Two excluded resource controls, `/assets/__phase2f-missing.js` and `/images/__phase2f-missing.webp`, returned Vercel's 404 error HTML without an app root or robots directives in production. Local preview returned the homepage shell with the same HTML Accept header, an example of preview behavior that differs from the edge.

The current response is a soft-404 risk. It sends a success status for an empty body or a client-rendered error. The noindex directive addresses indexing eligibility while the HTTP status still reports success. A real 404 communicates the missing resource directly to crawlers and clients. The audit did not inspect Search Console classifications. [Google Search Central crawling guidance](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors#soft-404)

## Recommended implementation

1. **Preserve the explicit rewrites and close the compatibility gap.** Derive or validate the accepted path inventory against the same canonical definitions, alias list, catalogue and basket route at build time. Before removing the catch-all, add constrained mappings for resolver-valid pathname variants that still rely on it, especially mixed-case requests such as `/PRODUCT/MANGOES/CHAUNSA`. Prefer exact path-derived case-insensitive matching to the same generated documents, retaining the requested URL and query. Verify the supported matcher syntax and normalization order on Vercel. Check repeated separators in product and study routes against observed edge normalization. Use a narrow hosting matcher tied to the same inventory if static rule syntax cannot express the necessary compatibility reliably. A wildcard for all product or study slugs would retain false 200s.
2. **Remove the generic rewrite once valid coverage is proven.** Let Vercel resolve physical files and the preserved rules, then return its native 404 on a miss. The existing native asset 404s demonstrate that this deployment can emit a true unmatched response. Keep `trailingSlash: false`; a normalizing 308 followed by a terminal 404 is consistent with the current policy. Keep current alias rewrites and canonical heads, and give any confirmed moved URL an explicit permanent redirect to its actual replacement ahead of the miss. [Vercel rewrites](https://vercel.com/docs/routing/rewrites) · [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json)
3. **Use a static, visible error document.** Generate `dist/404.html` with BAAGH's existing not-found wording and links, preserving the approved appearance. The document should show useful content and working links to `/` or `/everyday-fresh` without JavaScript, with no canonical and optional explicit noindex. Vercel documents automatic use of this output file for unmatched static requests. A plain rewrite to an HTML file does not itself assign 404. Update the build checker to allow the one static error body separately while still enforcing exactly eight React prerender markers. Verify a direct request to `/404.html` separately, since serving the file by name and serving it as the error document may have different statuses. [Vercel custom 404 page](https://vercel.com/kb/guide/custom-404-page)

**Fragment compatibility.** Keep all current hash and query behavior on valid base paths and keep client-side history semantics. A fresh request to a genuinely missing pathname carrying a recognized hash is indistinguishable at HTTP level from the same request without that hash. There is no evidence that these arbitrary base paths are published legacy links. If direct entry for them must also remain functional, return HTTP 404 with a visible static fallback that can progressively boot the existing App on recognized fragments. That compatibility layer would require its own browser and SEO proof. Designated legacy links on valid base paths already retain their existing route handling.

**Other hosting options.** A status-bearing Vercel route can pair a body and status if native static error handling is unsuitable, but needs proof of rule precedence, asset handling and normalization. A function that returns 404 is feasible if static routing cannot cover the valid path variants. Restrict it to the necessary routing scope and keep ordinary pages static. It adds runtime and cache behavior to verify. Global middleware, SSR, or a framework migration would expand the change beyond what this static deployment needs. [Vercel route status and ordering](https://vercel.com/docs/build-output-api/configuration) · [Vercel routing middleware](https://vercel.com/docs/routing-middleware)

## Deployment and acceptance gates

- Keep the current build command, output directory, SEO generation, React providers and bootstrap architecture. Verify a clean build, the exact eight prerender markers and JSON-LD, canonicals and crawler-file parity. Check all 34 route mappings against generated files and the shared registry so a new legitimate route cannot silently become a 404.
- In an approved Vercel preview or equivalent edge test, run raw GET and HEAD against the full inventory. All 19 canonical entries, 14 aliases and basket should keep their existing response and head. Verify existing static assets, crawler resource MIME types and missing asset statuses. Verify any independently configured redirects if present in project settings.
- Repeat every missing probe, including near-miss slugs, a valid slug under the wrong category, missing URLs carrying queries, nested paths, and trailing or repeated separators. Confirm final 404, no homepage redirect, correct body and a visible no-JavaScript experience. Record first and terminal responses separately and verify queries survive legitimate normalization redirects. Check representative mixed-case valid and missing paths.
- In-browser, test direct entry, hard refresh, in-app navigation, Back and Forward, older query and hash links, collection anchors, product links and pack selection, basket persistence, Signature, the homepage journey, and all four Fruit Intelligence reading and 3D paths. Check the eight prerendered pages with JavaScript disabled, then confirm successful hydration and no visual regressions with JavaScript enabled. A client-only transition has no separate document response status.
- Keep the approved UI, catalogue, resolver, aliases, homepage cinematic experience, Fruit Intelligence scenes, robots.txt and sitemap content intact. Re-run the production HTTP matrix after any separately approved release. This audit made no production source or Vercel configuration changes, and performed no commit, push or deployment.
