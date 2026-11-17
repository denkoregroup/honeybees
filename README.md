# HoneyBee Designs

Storefront for HoneyBee Designs, a sublimation merch brand (tumblers, apparel, keychains, decals, gifts). Live at https://honeybees-wine.vercel.app. Built with Next.js 16 (App Router), React 19, TypeScript 5 and Tailwind CSS 4. Products and collections are read live from the Shopify Storefront API, and the cart uses it too; contact email goes through Resend.

## Run locally

```bash
npm install
```

Create `.env.local` with these variables:

- `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: required. The shop pages read products and collections through the server-only catalog layer in `lib/storefront/` (see below), and `pnpm build` and `pnpm dev` fail without them. `SHOPIFY_STOREFRONT_TOKEN_TYPE` is optional: `private` (default) or `public`, the kind of token the access token is.
- `SHOPIFY_STOREFRONT_API_URL`: store domain for the cart and `/api/checkout` only (`lib/shopify.ts`); it goes away with #9.
- `RESEND_API_KEY`: needed for the contact form (`/api/contact`).
- `CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_URL`: optional; both have defaults in code.

```bash
npm run dev
```

Open http://localhost:3000. `npm run lint` runs ESLint.

## Folders

- `app/`: routes and API routes (App Router)
- `components/`: UI, grouped by `home/`, `features/`, `layout/`, `ui/` and `emails/`
- `lib/`: the server-only catalog layer (`storefront/`), cart-only Shopify calls (`shopify.ts`), variant selection logic, helpers
- `store/`: Zustand cart store
- `public/`: static assets

## Catalog layer and data flow

`lib/storefront/` is a server-only, read-only layer over the Shopify Storefront API: `getProducts` and `getCollectionByHandle` return `ProductSummary` records for cards, `getProductByHandle` returns the full `Product` with all variants, and `getCollections` lists collections. Results are typed and flattened. Run `pnpm verify:shopify` to check your env vars against the store (needs Node 22.9 or newer).

The home, `/shop`, `/shop/[collection]`, `/shop/[collection]/[product]` and `/collections` pages are server components that call this layer and pass props to the client components. There is no placeholder data and no fallback: Shopify is the source of truth.

- **Freshness:** every read is cached for 5 minutes (time-based revalidation, with cache tags for later on-demand invalidation), so catalog edits show up within about 5 minutes.
- **Failures:** if Shopify can't be reached or the env vars are missing, the page renders the error state in `app/error.tsx`, and the failure is logged server-side. A build fails the same way.
- **Unknown handles:** an unknown collection or product handle returns a 404. A product page ignores the collection in its URL except for the breadcrumb.
- **Variants:** the product page shows one picker row per option with more than one value, so a product with only the default "Title" option shows none. Availability is Shopify's `availableForSale`; inventory counts are not used, because items are made to order.
- **Descriptions:** product descriptions are shown as plain text; `descriptionHtml` is not rendered.
- **Collections:** `/collections` lists every collection Shopify returns. The catalog layer doesn't say whether a collection has products, so empty collections are listed too.

## Tests

`pnpm test` runs the unit tests once (`pnpm test:watch` re-runs on change) with Vitest in a plain Node environment; no secrets or network are needed. They live in `lib/storefront/__tests__/` (the catalog layer, with fetch mocked, so they say nothing about live Shopify behavior) and `lib/__tests__/` (variant selection). CI runs lint, tests and build on every pull request.

## Deployment

Hosted on Vercel; the Shopify and Resend variables above are set in the Vercel project settings. The build reads the live store, so CI and Vercel builds need the Shopify variables. There is no deployment config in this repo.

## For AI coding agents

See `CLAUDE.md` and `AGENTS.md`. This repo uses a Next.js version with breaking changes, so read `node_modules/next/dist/docs/` before changing framework-level code.
