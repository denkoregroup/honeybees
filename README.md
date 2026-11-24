# HoneyBee Designs

Storefront for HoneyBee Designs, a sublimation merch brand (tumblers, apparel, keychains, decals, gifts). Live at https://honeybees-wine.vercel.app. Built with Next.js 16 (App Router), React 19, TypeScript 5 and Tailwind CSS 4. Products and collections are read live from the Shopify Storefront API, and the cart uses it too; contact email goes through Resend.

## Run locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. Create `.env.local` first:

- `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: required. Products, collections and the cart all come from Shopify, and the app won't start or build without them. `SHOPIFY_STOREFRONT_TOKEN_TYPE` is optional: `private` (default) or `public`.
- `RESEND_API_KEY`: needed for the contact form.
- `CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_URL`: optional; both have defaults.

`pnpm lint` and `pnpm test` run the checks. CI also runs `pnpm build`.

## Where things are

- `app/`: pages and API routes
- `components/`: UI, grouped by area
- `lib/`: the server-only Shopify layer (`storefront/`) and shared helpers
- `store/`: cart UI state
- `docs/`: architecture notes, the agent guide and Shopify integration lessons

Shopify is the source of truth for products, collections and the cart; checkout is Shopify-hosted. How it fits together is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Deployment

Hosted on Vercel, with the Shopify and Resend variables set in the Vercel project. Builds read the live store, so CI and Vercel both need the Shopify variables.

## For AI coding agents

See `CLAUDE.md`, `AGENTS.md` and [docs/AGENT_GUIDE.md](docs/AGENT_GUIDE.md). This repo uses a Next.js version with breaking changes, so read `node_modules/next/dist/docs/` before changing framework-level code.
