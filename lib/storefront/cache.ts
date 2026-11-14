/** Time-based revalidation for all catalog reads (seconds). */
export const REVALIDATE_SECONDS = 300

/**
 * Cache tags attached to every catalog fetch. A future webhook route can call
 * `revalidateTag(CACHE_TAGS.products, "max")` etc. without touching this layer.
 */
export const CACHE_TAGS = {
  products: "shopify:products",
  collections: "shopify:collections",
  product: (handle: string) => `shopify:product:${handle}`,
  collection: (handle: string) => `shopify:collection:${handle}`,
} as const
