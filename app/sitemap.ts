import type { MetadataRoute } from "next"
import { getCollections, getProducts } from "@/lib/storefront"
import { absoluteUrl, collectionPath, productPath } from "@/lib/site"

const PAGES = ["/", "/shop", "/collections", "/about", "/contact"]

// Same page sizes as /shop and /collections, so this lists what those pages link to. getCollections
// already drops empty collections. Cached like other catalog reads (5 minutes).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
    getProducts({ first: 250 }),
    getCollections({ first: 250 }),
  ])
  return [
    ...PAGES,
    ...collections.items.map((c) => collectionPath(c.handle)),
    ...products.items.map(productPath),
  ].map((path) => ({ url: absoluteUrl(path) }))
}
