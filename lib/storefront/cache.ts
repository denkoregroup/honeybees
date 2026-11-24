/** Time-based revalidation for all catalog reads (seconds). */
export const REVALIDATE_SECONDS = 300

/**
 * Cache tags attached to every catalog fetch. A future webhook route can call
 * `revalidateTag(CACHE_TAGS.products, "max")` etc. without touching this layer.
 */
export const CACHE_TAGS = {
  products: "shopify:products",
  collections: "shopify:collections",
  policies: "shopify:policies",
  // Tags travel in an HTTP header, which only accepts ASCII. Handles can contain emoji
  // (e.g. "shop-small-sip-big-🐢-copy-1"), so percent-encode them.
  product: (handle: string) => `shopify:product:${encodeURIComponent(handle)}`,
  collection: (handle: string) => `shopify:collection:${encodeURIComponent(handle)}`,
} as const
