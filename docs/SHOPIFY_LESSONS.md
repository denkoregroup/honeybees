# Shopify integration lessons

Problems hit while building this store on the Storefront API, and what fixed them. For the next headless Shopify build. Each entry: what happened, the fix or rule, where it lives.

## Lessons

**Token type (public vs private).** The first CI build against the live store got a 403 on its first catalog read: the secret held a public token, but the code sends tokens as private by default (`Shopify-Storefront-Private-Token`). A 403 means Shopify rejected the credential: wrong token type, missing scopes or a token from another store. Fix: `SHOPIFY_STOREFRONT_TOKEN_TYPE` (`private` default, or `public`), set to `public` in CI and needed in every environment that builds. Moving production to a private token is #18. Where: `tokenOptions()` in `lib/storefront/client.ts`, `.github/workflows/ci.yml` (PR #38).

**Buyer IP.** With a private token, cart requests send `Shopify-Storefront-Buyer-IP` (the first `x-forwarded-for` address). Catalog reads never send it: reading request headers would make cached catalog pages dynamic. With a public token it isn't sent. Where: `cartRequest()` in `lib/storefront/client.ts` (PRs #30, #39).

**API version.** The original code pinned `2024-10`, which Shopify had retired, so requests were served by the oldest supported version instead. Rule: pin a dated version and bump it on purpose. Default `2026-10`, override with `SHOPIFY_STOREFRONT_API_VERSION`. Where: `DEFAULT_API_VERSION` in `lib/storefront/client.ts` (PR #16).

**Channel publishing.** The storefront only sees what is published to its sales channel (the Headless channel), so Admin isn't a reliable view of what the site shows. An unpublished product or collection comes back as `null` and its page is a 404. About 136 empty collections were published, so `getCollections` asks for one product and drops empty ones. Duplicates, empty collections and the private token are #18. Where: `lib/storefront/products.ts`, `lib/storefront/collections.ts` (PRs #42, #60).

**next/image needs the Shopify CDN host.** Every product photo was broken: `/_next/image` answered 400 because `next.config.ts` listed no image host. Fix: one `remotePatterns` entry, `https://cdn.shopify.com/s/files/**`, with no `search` key, since Shopify image URLs end in `?v=`. Where: `next.config.ts`, `test/next-config.test.ts` (PR #48).

**Emoji in handles.** A product handle with an emoji crashed its page with "Cannot convert argument to a ByteString": cache tags travel in an internal HTTP header, and header values must be ASCII. Fix: tags percent-encode the handle; the handle sent to Shopify stays raw. Where: `CACHE_TAGS` in `lib/storefront/cache.ts` (PR #56).

**Hardcoded handles.** Five of the six collection tiles on the home page pointed at handles that didn't exist in Shopify, and the sixth was empty. Rule: build tiles from live data and drop missing or empty collections; check any curated handle against the store. Where: `components/home/categories.ts`, `components/home/collection-tiles.ts`, `app/page.tsx` (PR #60).

**Expired carts.** The docs don't say what error code a cart mutation returns for an expired cart. So when adding a line fails with user errors, the code checks with the `cart` query (null for a cart Shopify no longer has) and only then creates a new cart. Where: `addLine()` in `lib/storefront/cart.ts` (PR #39).

**Async root layout.** The footer fetches the store policies, so it is an async server component inside the root layout. Tests that render it synchronously break; await it. Where: `components/layout/Footer.tsx`, `components/layout/__tests__/footer.test.ts` (PR #57).

**Two Vercel statuses.** Each PR gets two statuses named "Vercel – honeybees". Ours links to the `davids-projects` team; the other belongs to a second team's project and fails on every PR. Filter by `target_url`. Where: `docs/AGENT_GUIDE.md`, Known traps.

## Limits the code reads up to

Per product: 20 images and 10 collections. The first 100 variants come with the product, then up to 4 more pages of 250 (1,100 in all); past that a `[shopify]` error is logged (`MAX_EXTRA_VARIANT_PAGES` in `lib/storefront/products.ts`). A cart reads up to 100 lines. Page size is capped at 250.

**Not yet hit:** Shopify's product option and variant limits.

## Where Shopify failures show up

Server logs go to Vercel's runtime logs: project `honeybees` in the `davids-projects` team, Logs tab. Search `[shopify]`. That is the only error tracker for now; choosing a dedicated one is the open question in #22.

| Log line | Meaning |
| --- | --- |
| `[shopify] <operation> failed` `{ status, detail }` | A Storefront request failed. `status` is the HTTP status (200 with GraphQL errors, none for a network failure); `detail` is Shopify's GraphQL error messages or the client's error text. |
| `[shopify] <operation> returned user errors` `{ codes }` | Shopify rejected a cart change. Only the error codes are logged. |
| `[shopify] getProductByHandle: variant page cap reached for "<handle>"` | A product has more variants than the code fetches. |
| `[cart] <action> failed <ErrorName>`, `[cart] <action> rejected invalid input` | A cart Server Action failed or got bad input. |
| `[footer] policy links unavailable <ErrorName>` | The footer left out the policy links. |

When a page fails, Next also logs the thrown error with its digest (message `Shopify <operation> failed: ...`). Missing or malformed env vars throw `ShopifyConfigError`, which has no `[shopify]` line: search `ShopifyConfigError`. Its message names the variable, never the value, and a build fails with the same message.

Never logged: the token, request headers, the buyer IP, query variables, cart ids or checkout URLs. `lib/storefront/__tests__/logging.test.ts` fails if the token, the token or buyer-IP header names or the buyer IP reach a failure log line or the thrown error; `cart.test.ts` does the same for cart ids, checkout URLs, the token and the buyer IP in user-error lines.
