# HoneyBee Designs

Storefront for HoneyBee Designs, a sublimation merch brand (tumblers, apparel, keychains, decals, gifts). Deployed on Vercel at honeybees-wine.vercel.app.

This document describes what the code implements today, not planned work.

## Stack

From `package.json`:

- **Framework:** Next.js 16.2.6 (App Router) on React 19.2.4, TypeScript 5. This Next.js version has breaking changes from older releases; see `AGENTS.md` and `node_modules/next/dist/docs/` before changing framework-level code.
- **Styling/UI:** Tailwind CSS 4 (`@tailwindcss/postcss`), Radix UI primitives, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` icons, `motion` for animation, `next-themes`, `react-masonry-css`, `yet-another-react-lightbox`.
- **Commerce:** `@shopify/storefront-api-client` (Shopify Storefront GraphQL API, version `2024-10`).
- **State:** `zustand` (with `persist` middleware) for the cart.
- **Email:** `resend` and `@react-email/components`.
- **Tooling:** ESLint 9 with `eslint-config-next`.

Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`. Both `package-lock.json` and `pnpm-lock.yaml` are committed.

## Layout

| Path | Contents |
| --- | --- |
| `app/` | Routes: `/`, `/shop`, `/shop/[collection]`, `/shop/[collection]/[product]`, `/collections`, `/cart`, `/about`, `/contact`, plus API routes under `app/api/` |
| `components/` | `home/` (homepage sections), `features/` (product cards, cart drawer, filters, forms), `layout/` and top-level `header`/`footer` files, `ui/` primitives, `emails/` (React Email templates) |
| `lib/shopify.ts` | Storefront API client, GraphQL queries/mutations, response normalisers |
| `lib/types.ts` | `Product`, `Variant`, `Collection`, `CartItem`, `ContactFormData` |
| `data/products.ts` | Local fallback data (see below) |
| `store/cart.ts` | Zustand cart store |

## `data/`

`data/products.ts` is the only file. It exports:

- `placeholderCollections`: six collections (Apparel, Drinkware, Keychains, Stickers & Decals, Gift Ideas, Bundles) with handles, titles and descriptions.
- `placeholderProducts`: six hand-written products (Bee Kind Tumbler, Mama Bee Hoodie, You Are My Sunshine Pillow, Radiate Kindness Keychain, Blessed Mama Car Coasters, Adventure Awaits Decal), each with variants and prices. Names are seeded from the real Shopify store, but `images` is empty (a `TODO` notes real images are to come from Drive), and ratings/review counts are hardcoded. Variant IDs like `var-1-20oz` are fake, not Shopify IDs.

Two products reference collection handles (`home-lifestyle`, `car-coasters`) that are not in `placeholderCollections`.

## `store/`

`store/cart.ts` is a client-side Zustand store (`useCartStore`) that holds `cartId`, `checkoutUrl`, `items`, and drawer open/loading flags, with `addItem`, `removeItem`, `updateQuantity`, `total` and `itemCount`. Cart operations call `createCart`, `addToCart`, `removeFromCart` and `updateCartQuantity` from `lib/shopify.ts`, so the cart is a Shopify Storefront cart, not a local one. Only `cartId` and `checkoutUrl` are persisted (localStorage key `honeybee-cart`); line items are not persisted and are rebuilt from Shopify's responses. The cart page and drawer link out to Shopify's `checkoutUrl` for payment.

## How product data flows

Product data comes from **both** Shopify and local data, depending on the page.

`lib/shopify.ts` queries the Storefront API (products, collections by handle, product by handle). Every function returns an empty result (`[]` or `null`) when the Shopify env vars are missing or a request fails, and the pages then fall back to `data/products.ts`:

- **`/shop`:** `getProducts(48)` from Shopify; uses `placeholderProducts` if that returns nothing.
- **`/shop/[collection]`:** `getCollectionByHandle`; the page 404s only if the handle is unknown to both Shopify and `placeholderCollections`. If the live collection has no products, it filters `getProducts(48)` (or the placeholders) by collection handle. `generateStaticParams` uses only `placeholderCollections`, so the statically generated collection pages are the six local handles.
- **`/shop/[collection]/[product]`:** `getProductByHandle`, falling back to a matching placeholder. Static params come from Shopify products if available, otherwise the placeholders.
- **`/` (homepage):** the featured products are `placeholderProducts` directly. The homepage does not query Shopify.
- **Collection tiles on the homepage/`/collections`:** not sourced from `getCollections`, which is defined but not called anywhere.

Shopify responses are normalised into the types in `lib/types.ts` so components handle live and placeholder data identically.

### Known gaps visible in the code

- `store/cart.ts` is a client store that imports `lib/shopify.ts`, which reads `SHOPIFY_STOREFRONT_API_URL` / `SHOPIFY_STOREFRONT_ACCESS_TOKEN`. Those names have no `NEXT_PUBLIC_` prefix, so Next.js does not expose them to browser code. In the browser `isConfigured()` is therefore false and `createCart()` returns `null`, so adding to cart appears to be a no-op as written. Moving cart calls behind server actions or API routes would fix this. This was determined by reading the code, not by running the site.
- `app/api/checkout/route.ts` (creates a Shopify cart from posted items and returns a `checkoutUrl`) is not called from anywhere in the app.
- `components/emails/OrderEmail.tsx` is not used by any route.
- `/api/newsletter` validates the email and logs it; it does not store or forward it (`TODO` in the code).
- Placeholder variant IDs are not valid Shopify merchandise IDs, so placeholder products could not be bought through Shopify even if the cart calls worked.

## Catalog layer

`lib/storefront/` is a server-only, read-only layer over the Shopify Storefront API: `getProducts` and `getCollectionByHandle` return lightweight `ProductSummary` records for cards, `getProductByHandle` returns the full `Product` with all variants, and `getCollections` lists collections. Results are typed, flattened and cached with 5-minute revalidation and cache tags. Set `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` (see `.env.example`), then run `npm run verify:shopify` to check them against the store. That script uses `--env-file-if-exists` and needs Node 22.9 or newer.

## API routes

- `POST /api/contact`: validates name/email/message, sends a `ContactEmail` via Resend, reply-to set to the submitter. Returns 503 if `RESEND_API_KEY` is unset.
- `POST /api/newsletter`: described above.
- `POST /api/checkout`: described above. Returns 503 if `SHOPIFY_STOREFRONT_API_URL` is unset.

## Environment variables

Names and purpose only. Set them in `.env.local` locally and in the Vercel project settings for deployment (`.env*` is git-ignored).

| Variable | Used in | Purpose |
| --- | --- | --- |
| `SHOPIFY_STOREFRONT_API_URL` | `lib/shopify.ts`, `app/api/checkout/route.ts` | Shopify store domain passed to the Storefront API client as `storeDomain` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | `lib/shopify.ts` | Storefront API public access token |
| `RESEND_API_KEY` | `app/api/contact/route.ts` | Resend API key for contact-form email |
| `CONTACT_EMAIL` | `app/api/contact/route.ts` | Recipient of contact-form messages (optional; the code has a default) |
| `NEXT_PUBLIC_SITE_URL` | `app/layout.tsx` | Canonical site URL for metadata (optional; the code has a default) |

`NODE_ENV` is also read (in `lib/shopify.ts`) to log Shopify errors outside production.

## Local development

```bash
npm install
npm run dev
```

With no Shopify variables set, the site runs entirely on `data/products.ts`.
