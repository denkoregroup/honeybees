# HoneyBee Designs

Storefront for HoneyBee Designs, a sublimation merch brand (tumblers, apparel, keychains, decals, gifts). Live at https://honeybees-wine.vercel.app. Built with Next.js 16 (App Router), React 19, TypeScript 5 and Tailwind CSS 4. Products and collections are read live from the Shopify Storefront API, and the cart uses it too; contact email goes through Resend.

## Run locally

```bash
npm install
```

Create `.env.local` with these variables:

- `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: required. The shop pages read products and collections through the server-only catalog layer in `lib/storefront/` (see below), and `pnpm build` and `pnpm dev` fail without them. `SHOPIFY_STOREFRONT_TOKEN_TYPE` is optional: `private` (default) or `public`, the kind of token the access token is.
- `RESEND_API_KEY`: needed for the contact form (`/api/contact`).
- `CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_URL`: optional; both have defaults in code.

```bash
npm run dev
```

Open http://localhost:3000. `npm run lint` runs ESLint.

## Folders

- `app/`: routes and API routes (App Router)
- `components/`: UI, grouped by `home/`, `features/`, `layout/`, `ui/` and `emails/`
- `lib/`: the server-only Shopify layer (`storefront/`: catalog and cart), input checks and variant selection logic, helpers
- `app/actions/`: the cart Server Actions
- `store/`: Zustand store for cart UI state
- `public/`: static assets

## Catalog layer and data flow

`lib/storefront/` is a server-only, read-only layer over the Shopify Storefront API: `getProducts` and `getCollectionByHandle` return `ProductSummary` records for cards, `getProductByHandle` returns the full `Product` with all variants, `getCollections` lists collections, and `getShopPolicies` returns the store policies that exist in Shopify (title and Shopify-hosted URL; the footer links only those). Results are typed and flattened. Run `pnpm verify:shopify` to check your env vars against the store (needs Node 22.9 or newer).

The home, `/shop`, `/shop/[collection]`, `/shop/[collection]/[product]` and `/collections` pages are server components that call this layer and pass props to the client components. There is no placeholder data and no fallback: Shopify is the source of truth.

- **Freshness:** every read is cached for 5 minutes (time-based revalidation, with cache tags for later on-demand invalidation), so catalog edits show up within about 5 minutes.
- **Failures:** if Shopify can't be reached or the env vars are missing, the page renders the error state in `app/error.tsx`, and the failure is logged server-side. A build fails the same way.
- **Unknown handles:** an unknown collection or product handle returns a 404. A product page ignores the collection in its URL except for the breadcrumb.
- **Variants:** the product page shows one picker row per option with more than one value, so a product with only the default "Title" option shows none. Availability is Shopify's `availableForSale`; inventory counts are not used, because items are made to order.
- **Requested colors:** a product whose Color option has a value named exactly "Other" shows it last as "Other (request a color)". Choosing it reveals a text box (1 to 40 characters, trimmed); Add to cart stays disabled until something is typed. The text is sent as the cart line attribute "Requested color" and shown on the line in the cart. Lines for the same variant with different typed colors stay separate lines. The text is never put in a URL and is only ever rendered as escaped text.
- **Descriptions:** product descriptions are shown as plain text; `descriptionHtml` is not rendered.
- **Collections:** `/collections` lists collections that have at least one product; `getCollections` drops empty ones, so a page can come back shorter than asked.

## Cart and checkout

The cart is a Shopify cart, handled entirely on the server so the Storefront token never reaches the browser. The product page, drawer and `/cart` page call the Server Actions in `app/actions/cart.ts` (`addToCart`, `updateLine`, `removeLine`, `getCart`), which call `lib/storefront/cart.ts`.

- **Cart id:** kept in an httpOnly, SameSite=Lax cookie (Secure in production, 30 days). The browser never sees it. The actions return only the cart contents (lines, totals and the checkout URL), and the Zustand store in `store/cart.ts` holds that last snapshot plus drawer and pending state. Nothing is persisted in the browser.
- **Validation:** the actions check inputs on the server (a ProductVariant id, a quantity from 1 to 99; 0 on update removes the line). Failures return a generic message and are logged without cart ids, URLs or tokens.
- **Expired carts:** adding to a cart Shopify no longer has creates a new one with the item in it. Loading a cart Shopify no longer has clears the cookie and shows an empty cart.
- **No caching:** cart requests use `cache: "no-store"` and no tags, unlike catalog reads (5-minute revalidation). With a private token, cart requests also send the buyer's IP (`Shopify-Storefront-Buyer-IP`); with a public token they don't, and catalog reads never do.
- **Checkout:** the drawer and `/cart` link to the cart's `checkoutUrl`, Shopify's hosted checkout.

## Tests

`pnpm test` runs the unit tests once (`pnpm test:watch` re-runs on change) with Vitest in a plain Node environment; no secrets or network are needed. They live in `lib/storefront/__tests__/` (the catalog layer, with fetch mocked, so they say nothing about live Shopify behavior) and `lib/__tests__/` and `app/actions/__tests__/` (variant selection, input checks and the cart Server Actions, again with fetch mocked). CI runs lint, tests and build on every pull request.

## Deployment

Hosted on Vercel; the Shopify and Resend variables above are set in the Vercel project settings. The build reads the live store, so CI and Vercel builds need the Shopify variables. There is no deployment config in this repo.

## For AI coding agents

See `CLAUDE.md` and `AGENTS.md`. This repo uses a Next.js version with breaking changes, so read `node_modules/next/dist/docs/` before changing framework-level code.
