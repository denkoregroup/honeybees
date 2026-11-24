# Agent guide: HoneyBee Designs

Agent sessions follow the
[Denkore agent standard](https://github.com/denkoregroup/denkore-orchestrator/blob/main/docs/agents/STANDARD.md).
This file adds what's specific to this repo. Read `AGENTS.md` and the README first.

## Project

- Headless Shopify + Next.js 16 store for client Sarah Tabb (sublimation merch). Checkout is
  Shopify-hosted.
- Stack: React 19, TypeScript, Tailwind v4, pnpm, Vitest.
- Vercel: team `davids-projects-0ec1b950`, project `honeybees`.
- Go-live target: about **Dec 8, 2026**. David's target; the client has no hard date.

## Commands

| Check | Command | In the sandbox? |
| --- | --- | --- |
| Install | `pnpm install` | yes |
| Lint | `pnpm lint` | yes |
| Tests | `pnpm test` | yes |
| Types | `pnpm exec tsc --noEmit` | yes |
| Build | `pnpm build` | **no**: `next/font/google` can't reach Google Fonts. CI (`.github/workflows/ci.yml`) and Vercel previews build it. Say so in every PR. |

## Live systems and approval

- **Shopify admin:** read queries are fine for checking facts. Ask David before any change
  (products, handles, collections, policies, redirects).
- **Vercel settings and env vars, DNS:** ask before any change.
- Never put the Storefront token, store credentials or signed URLs in code, logs, issues or PRs.

## Known traps

- **Two Vercel statuses named "Vercel – honeybees."** Ours links to team `davids-projects`; the
  other belongs to a second team's project (`honeybeedesigns`), fails on every PR and can't be
  read. Filter statuses by `target_url` containing `davids-projects`.
- The footer fetches Shopify policies, so the root layout is async. Tests that render it
  synchronously break.
- Cache tags are percent-encoded in `lib/storefront/cache.ts` because product handles can contain
  emoji and tags travel in a header.
- The home page collection tiles are live data, so the home page fails if Shopify is down. Decide
  the failure behavior in #24.

## Queue snapshot (Nov 24, 2026; check GitHub before acting)

Main was `eb3fcb6` with no open PRs and about 326 tests passing. David picks the order.

1. Desktop hero placeholder still says "Product photos coming from Sarah!". Waiting on photos, or
   use real Shopify product images.
2. #24 Launch readiness (SEO, accessibility, failure states). Labelled `refine-before-starting`:
   refine first.
3. #21 Live products everywhere. The issue text may be stale (pages already read from
   `lib/storefront`); verify what's left first.
4. #34 leftovers (ops): Resend sender domain, custom domain, set `NEXT_PUBLIC_SITE_URL` and
   `CONTACT_EMAIL` explicitly. Rate limiting stays deferred.
5. #32 leftovers: Terms, Shipping and Refund policies must be created in Shopify admin (only a
   Privacy Policy exists). The FAQ link waits on #25.
6. Copy to verify with the client (through David): product page shipping and returns lines,
   TrustBar shipping line, about story, footer payment logos, contact response-time promises.

Drift found Nov 24: #41 (next/image blocks Shopify images) is still open, but `next.config.ts`
already allows `cdn.shopify.com` and `test/next-config.test.ts` covers it. Likely closable once a
preview shows product photos.

**Launch cutover (deferred on purpose):** #43, #44, #45, #46, #17, #18, #59. David also removes
`SHOPIFY_STOREFRONT_API_URL` from both Vercel projects.

**Shopify admin, no code (David or with his approval):** remove Decals and Keychains from Turtley
Coasters; unpublish about 136 empty collections; publish the Turtley Mama Coasters draft; check the
Kids Small Sweatshirt $20 price; "Turtley Apparel" vs "Apparel" possible duplicate; "Car Coasters"
is empty; the privacy policy has an empty "opt out here" link and a Gmail contact address.

**Waiting on the client:** product photos, color list and size charts, a note on custom colors,
confirmation of shipping times, returns and the about story.

**After launch:** #25, #29, #23, #22, #36, #33, #13, #12.
