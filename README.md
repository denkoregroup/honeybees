# HoneyBee Designs

Storefront for HoneyBee Designs, a sublimation merch brand (tumblers, apparel, keychains, decals, gifts). Live at https://honeybees-wine.vercel.app. Built with Next.js 16 (App Router), React 19, TypeScript 5 and Tailwind CSS 4. Products and cart come from the Shopify Storefront API; contact email goes through Resend.

## Run locally

```bash
npm install
```

Create `.env.local` with these variables:

- `SHOPIFY_STOREFRONT_API_URL` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: Storefront API store domain and public token. Without them the site runs on the placeholder data in `data/products.ts`.
- `RESEND_API_KEY`: needed for the contact form (`/api/contact`).
- `CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_URL`: optional; both have defaults in code.

```bash
npm run dev
```

Open http://localhost:3000. `npm run lint` runs ESLint.

## Folders

- `app/`: routes and API routes (App Router)
- `components/`: UI, grouped by `home/`, `features/`, `layout/`, `ui/` and `emails/`
- `lib/`: Shopify client and queries (`shopify.ts`), shared types, helpers
- `data/`: local placeholder products and collections used when Shopify is not configured
- `store/`: Zustand cart store
- `public/`: static assets

## Deployment

Hosted on Vercel; the Shopify and Resend variables above are set in the Vercel project settings. There is no deployment config in this repo.

## For AI coding agents

See `CLAUDE.md` and `AGENTS.md`. This repo uses a Next.js version with breaking changes, so read `node_modules/next/dist/docs/` before changing framework-level code.
