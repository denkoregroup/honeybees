/**
 * Calls each catalog function against the configured store and prints a summary.
 * Run: npm run verify:shopify   (reads .env.local; prints no secrets)
 */
import {
  ShopifyError,
  getCollectionByHandle,
  getCollections,
  getProductByHandle,
  getProducts,
  type Product,
} from "../lib/storefront"

const price = (p: Product) => {
  const v = p.variants[0]
  return v ? `${v.price.amount} ${v.price.currencyCode}` : "no variants"
}

async function main() {
  const products = await getProducts({ first: 5 })
  console.log(`getProducts(first:5): ${products.items.length} items, hasNextPage=${products.pageInfo.hasNextPage}`)
  for (const p of products.items) {
    console.log(`  - ${p.title} [${p.handle}] first variant ${price(p)}, ${p.images.length} images, ${p.variants.length} variants`)
  }
  if (products.pageInfo.hasNextPage) {
    const next = await getProducts({ first: 5, after: products.pageInfo.endCursor })
    console.log(`getProducts page 2: ${next.items.length} items (first: ${next.items[0]?.handle ?? "none"})`)
  }

  const first = products.items[0]
  if (first) {
    const byHandle = await getProductByHandle(first.handle)
    console.log(`getProductByHandle(${first.handle}): ${byHandle ? `${byHandle.title}, ${price(byHandle)}` : "null"}`)
  }
  const missing = await getProductByHandle("this-handle-does-not-exist")
  console.log(`getProductByHandle(missing): ${missing === null ? "null (expected)" : "UNEXPECTED non-null"}`)

  const collections = await getCollections({ first: 10 })
  console.log(`getCollections(first:10): ${collections.items.length} items, hasNextPage=${collections.pageInfo.hasNextPage}`)
  for (const c of collections.items) console.log(`  - ${c.title} [${c.handle}]`)

  const firstCollection = collections.items[0]
  if (firstCollection) {
    const full = await getCollectionByHandle(firstCollection.handle, { first: 5 })
    console.log(`getCollectionByHandle(${firstCollection.handle}): ${full?.products.items.length ?? "null"} products`)
    for (const p of full?.products.items ?? []) console.log(`    - ${p.title} [${p.handle}] ${price(p)}`)
  }
  const missingCollection = await getCollectionByHandle("this-handle-does-not-exist")
  console.log(`getCollectionByHandle(missing): ${missingCollection === null ? "null (expected)" : "UNEXPECTED non-null"}`)

  if (products.items.length === 0) {
    console.log(
      "\nNo products returned. Likely cause: products are not published to the Headless sales channel " +
        "(Shopify Admin > Products > Manage sales channels), or the token's scopes exclude product listings."
    )
  }
}

main().catch((err) => {
  if (err instanceof ShopifyError) console.error(`${err.name}: ${err.message}`)
  else console.error(err instanceof Error ? `${err.name}: ${err.message}` : "Unknown error")
  process.exit(1)
})
