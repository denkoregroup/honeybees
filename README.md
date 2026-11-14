# HoneyBee Designs

Storefront for HoneyBee Designs, a sublimation merch brand (tumblers, apparel, keychains, decals, gifts). Live at https://honeybees-wine.vercel.app. Built with Next.js 16 (App Router), React 19, TypeScript 5 and Tailwind CSS 4. Products and cart come from the Shopify Storefront API; contact email goes through Resend.

## Run locally

```bash
npm install
```

Create `.env.local` with these variables:

- `SHOPIFY_STOREFRONT_API_URL` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: Storefront API store domain and public token. Without them the site runs on the placeholder data in `data/products.ts`.
- `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: used by the server-only catalog layer in `lib/storefront/` (see below). `SHOPIFY_STOREFRONT_TOKEN_TYPE` is optional: `private` (default) or `public`, the kind of token the access token is.
- `RESEND_API_KEY`: needed for the contact form (`/api/contact`).
- `CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_URL`: optional; both have defaults in code.

```bash
npm run dev
```

Open http://localhost:3000. `npm run lint` runs ESLint.

## Folders

- `app/`: routes and API routes (App Router)
- `components/`: UI, grouped by `home/`, `features/`, `layout/`, `ui/` and `emails/`
- `lib/`: Shopify client and queries (`shopify.ts`), the server-only catalog layer (`storefront/`), shared types, helpers
- `data/`: local placeholder products and collections used when Shopify is not configured
- `store/`: Zustand cart store
- `public/`: static assets

## Catalog layer

`lib/storefront/` is a server-only, read-only layer over the Shopify Storefront API: `getProducts` and `getCollectionByHandle` return lightweight `ProductSummary` records for cards, `getProductByHandle` returns the full `Product` with all variants, and `getCollections` lists collections. Results are typed, flattened and cached with 5-minute revalidation and cache tags. Run `pnpm verify:shopify` to check your env vars against the store (needs Node 22.9 or newer). Pages do not use this layer yet.

## Tests

`pnpm test` runs the unit tests once (`pnpm test:watch` re-runs on change) with Vitest in a plain Node environment; no secrets or network are needed. They live in `lib/storefront/__tests__/` and cover the catalog layer with fetch mocked, so they say nothing about live Shopify behavior. CI runs lint, tests and build on every pull request.

## Deployment

Hosted on Vercel; the Shopify and Resend variables above are set in the Vercel project settings. There is no deployment config in this repo.

## For AI coding agents

See `CLAUDE.md` and `AGENTS.md`. This repo uses a Next.js version with breaking changes, so read `node_modules/next/dist/docs/` before changing framework-level code.
