# BAAGH SEO Phase 2F — True HTTP 404

20 November 2026. Local implementation. Preview and production acceptance are pending.

## Routing and error document

The Phase 2F feasibility audit measured HTTP 200 with an empty React root and `noindex, follow` for missing page paths. The terminal response remained 200 after slash normalization, and the body was blank without JavaScript.

Vercel keeps all 34 exact rewrites and `trailingSlash: false`. The generic rewrite and generated `spa.html` have been removed. Once a request misses all known mappings and physical files, Vercel's native static error handling is expected to return `dist/404.html` with HTTP 404. The document uses the approved commercial colour and type tokens, BAAGH's existing “Let’s find your fruit.” heading, and ordinary links to the homepage and Everyday Fresh. It has standalone responsive CSS, local font fallbacks, `noindex, follow`, and no canonical, React root, hydration marker, or script. Direct access to the physical file `/404.html` is a separate acceptance probe. Vercel documents an exception to its custom HTML page under `/api`, which BAAGH does not use for these page routes. [Vercel static 404 documentation](https://vercel.com/kb/guide/custom-404-page)

High-level Vercel rewrite sources match case-sensitively and support custom regular-expression capture groups. Each non-root registered path has an additional rewrite with an unnamed group per segment and literal letter classes, such as `[pP]`. Only case variants of known paths match. The destination is the same generated document, with its existing canonical metadata. Unnamed captures stay out of the destination query according to Vercel's rewrite compiler. This keeps `/PRODUCT/MANGOES/CHAUNSA` available at its requested URL, with the lowercase canonical and request query preserved. The configuration uses only the existing high-level mechanism. [Vercel configuration and route case sensitivity](https://vercel.com/docs/project-configuration/vercel-json) · [Vercel rewrite patterns](https://vercel.com/docs/routing/rewrites#using-regular-expressions) · [Vercel rewrite compiler](https://github.com/vercel/vercel/blob/main/packages/routing-utils/src/superstatic.ts)

Vercel normalizes consecutive slashes before routing. The existing trailing-slash policy also remains in force. The observed `/fruit-intelligence//apple` redirect should still end at the Apple study, and a missing slash-suffixed path should end at 404 after normalization. Current aliases remain rewrites with canonical target tags. Any separately configured moved-page redirects must continue to go to their intended replacements. [Vercel redirects and normalization](https://vercel.com/docs/routing/redirects)

Recognized fragments and query-based views continue to work on registered base paths. Fragments stay in the browser, so a request to `/__phase2f-missing#basket` reaches the host as a request for `/__phase2f-missing`. No published legacy link on that base path was found. Direct entry there receives the same 404 as the bare path. The client resolver and history handlers still govern navigation within a loaded application.

## Preserved inventory

| Entries | Paths |
| --- | --- |
| Eight prerendered canonical pages | `/everyday-fresh`, `/signature`, `/our-story`, `/product/mangoes/chaunsa`, and `/fruit-intelligence/chaunsa`, `/fruit-intelligence/kinnow`, `/fruit-intelligence/apple`, `/fruit-intelligence/anaar` |
| Eleven other canonical pages | `/`, `/product/citrus/kinnow`, `/product/apples/apple`, `/product/seasonal/anaar`, `/contact`, `/privacy-policy`, `/cookies`, `/terms`, `/delivery`, `/returns`, `/help` |
| Fourteen aliases | `/about`, `/about-us`, `/contact-us`, `/privacy`, `/cookie-policy`, `/terms-and-conditions`, `/faq`, `/shipping-policy`, `/refund-policy`, `/fruit-intelligence`, `/everyday-fresh/mangoes/chaunsa`, `/everyday-fresh/citrus/kinnow`, `/everyday-fresh/apples/apple`, `/everyday-fresh/seasonal/anaar` |
| Application | `/basket` with its existing `noindex, follow` |

The checker derives the required exact and case-compatible rewrite sets from the existing SEO registry, using its catalogue-backed canonical pages and aliases, plus basket. It requires corresponding output files, expected canonicals and robots tags, and rejects extra rewrites. It separately validates the static error document and counts exactly eight React prerender markers.

## Local validation

The existing build command and output directory are preserved. Vite Preview uses static file serving plus the project's explicit mappings, local slash normalization and a terminal static 404 handler. It is a local model of the expected response, with Vercel's routing and serving behavior subject to the Preview gate below.

- `npm run build`, `npm run check:types`, `npm run test:seo`, `npm test` (35 tests), and `git diff --check` passed.
- Local GET and HEAD passed for all 34 exact entries, 33 uppercase variants with queries, 12 query or fragment entries, 16 direct misses, 5 normalization chains, 4 crawler resources, the direct error file, and existing generated JS and image controls. Misses returned the generated error body on GET with terminal status 404. The physical `/404.html` returned 200 locally.
- Headless Chrome with JavaScript disabled confirmed readable 404s, visible recovery links, no horizontal overflow, and successful Everyday Fresh navigation at 375, 768 and 1440 pixels. With JavaScript enabled, Chrome confirmed mixed-case Chaunsa content, canonical and query, all 12 query and fragment views, and basket add, direct entry and reload persistence.
- Both `path-to-regexp` versions declared by Vercel's public routing compiler, 6.1.0 and 6.3.0, compiled every compatibility rule with Vercel's strict, case-sensitive settings. Lowercase, uppercase and alternating-case variants matched their intended files, and wrong-category, unknown-slug and extra-segment controls did not match. [Vercel routing compiler dependencies](https://github.com/vercel/vercel/blob/main/packages/routing-utils/package.json)
- The SHA-256 hashes of `robots.txt`, `sitemap.xml`, `llms.txt` and `seo-manifest.json` matched the pre-change build.
- Application source is unchanged, including the eight-route allowlist, resolver, SSR/hydration, product and basket systems, structured data, normal-page visuals, cinematic homepage, and Fruit Intelligence and WebGL systems. The build continues to emit its existing large chunk warning.

## Exact commit allowlist

- `vercel.json`
- `vite.config.ts`
- `scripts/build-seo.mjs`
- `scripts/check-seo.mjs`
- `docs/SEO_PHASE_2F_IMPLEMENTATION.md`

The feasibility report and other pre-existing untracked files were left outside this allowlist. Build output remains generated. No commit, push, or deployment was performed.

## Vercel Preview acceptance checklist

Start with the Preview URL for the dedicated feature branch and the expected commit. For each HTTP path, send GET and HEAD with redirects disabled on the initial request. Record the first status and `Location`, then follow any normalization manually and record the terminal status. Inspect the GET body and headers, and check HEAD status and headers without expecting a response body.

- [ ] Run all 34 entries listed above. Expected terminal 200 and the intended generated document, with self-canonicals for the 19 canonicals, the expected canonical target for each alias, and basket noindex. Compare alias targets with the feasibility report and confirm eight initial prerender markers across the canonical set.
- [ ] Test `/PRODUCT/MANGOES/CHAUNSA?utm_source=audit&x=1&x=2` and sample additional case variants across route families. Expect 200 and correct content, the canonical lowercase Chaunsa URL for that example, and the unchanged query. Test `/product/mangoes/chaunsa/?utm_source=audit`, `/about-us/` and `/fruit-intelligence//apple?fallback=true`. Expect 308 to the normalized path, query preserved, then 200 with the correct document.
- [ ] Test `/?fruit=apple`, `/?fruit=kinnow#kinnow`, `/#story`, `/#journey`, `/#signature-collection`, `/#basket`, `/#order`, `/#fruit-intelligence`, `/#anaar`, `/everyday-fresh#boxes`, `/everyday-fresh#ready-today` and `/fruit-intelligence/apple?fallback=true`. Expect 200 for each HTTP base path and the intended browser view or collection anchor.
- [ ] Probe `/__phase2f-missing`, `/__phase2f-missing-2`, `/product/mangoes/__phase2f-missing`, `/everyday-fresh/mangoes/__phase2f-missing`, `/fruit-intelligence/__phase2f-missing`, `/fruit-intelligence/chaunsa/extra`, `/nested/no/such/page`, `/__phase2f-missing?fruit=apple` and `/__phase2f-missing/`. Include `/__phase2f-missing#basket` in browser coverage.
- [ ] Probe `/PRODUCT/MANGOES/MISSING`, `/product/citrus/chaunsa`, `/fruit-intelligence/banana`, `/contact/unknown`, `/assets/__phase2f-missing.js`, `/images/__phase2f-missing.webp` and `/spa.html`. For all missing probes expect terminal 404, the visible BAAGH error body for these static requests, no React root, script or canonical, and no homepage redirect. Expect a direct 404 with no Location for ordinary misses and a normalizing 308 followed by 404 for the trailing-slash miss. Record direct `/404.html` separately as a request for the physical error document.
- [ ] Confirm crawler files return their original contents and correct types (plain text for robots and llms, XML for sitemap, JSON for the SEO manifest). Fetch an existing generated JS file and existing image, and verify content and MIME types.
- [ ] With JavaScript disabled, check all missing page cases at representative desktop, tablet and mobile sizes. Verify visible heading, readable explanation, both recovery actions, and no horizontal overflow. Follow the links. Check all eight prerenders still render meaningful HTML with JavaScript disabled.
- [ ] With JavaScript enabled, check prerender hydration, direct entry and hard refresh, browser history, aliases, product and basket navigation with basket persistence, homepage journey, and the four Fruit Intelligence reading and 3D views. Confirm any known dashboard-managed moved-page redirects remain intact.

Production acceptance requires a passing Preview matrix before merge and the same HTTP and browser checks against production after release. A local 404 result alone does not establish the edge behavior.
