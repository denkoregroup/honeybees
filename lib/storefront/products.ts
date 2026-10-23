import "server-only"

import { CACHE_TAGS } from "./cache"
import { storefrontRequest } from "./client"
import {
  normalizePage,
  normalizeProduct,
  normalizeProductSummary,
  type RawConnection,
  type RawProduct,
  type RawProductSummary,
  type RawVariant,
} from "./normalize"
import { pageVariables } from "./pagination"
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCT_VARIANTS_QUERY,
} from "./queries"
import type { Page, PageArgs, Product, ProductSummary } from "./types"

/** Extra variant pages fetched beyond the first 100, at 250 per page (1,100 variants total). */
const MAX_EXTRA_VARIANT_PAGES = 4
const EXTRA_VARIANTS_PAGE_SIZE = 250

export async function getProducts(args: PageArgs = {}): Promise<Page<ProductSummary>> {
  const data = await storefrontRequest<{ products: RawConnection<RawProductSummary> }>(
    "getProducts",
    PRODUCTS_QUERY,
    pageVariables(args, 24),
    [CACHE_TAGS.products]
  )
  return normalizePage(data.products, normalizeProductSummary)
}

/**
 * Returns the full product, or null when the handle doesn't exist or the product isn't published
 * to this storefront. Variants beyond the first page are fetched in a bounded loop.
 */
export async function getProductByHandle(handle: string): Promise<Product | null> {
  if (!handle.trim()) return null
  const tags = [CACHE_TAGS.products, CACHE_TAGS.product(handle)]

  const data = await storefrontRequest<{
    product: (Omit<RawProduct, "variants"> & { variants: RawConnection<RawVariant> }) | null
  }>("getProductByHandle", PRODUCT_BY_HANDLE_QUERY, { handle }, tags)
  if (!data.product) return null

  const { variants: firstPage, ...rest } = data.product
  const variants = [...firstPage.nodes]
  let { hasNextPage, endCursor } = firstPage.pageInfo

  for (let page = 0; hasNextPage && endCursor; page++) {
    if (page === MAX_EXTRA_VARIANT_PAGES) {
      console.error(
        `[shopify] getProductByHandle: variant page cap reached for "${handle}"; ` +
          `returning ${variants.length} variants but more exist. Raise MAX_EXTRA_VARIANT_PAGES in lib/storefront/products.ts.`
      )
      break
    }
    const more = await storefrontRequest<{ product: { variants: RawConnection<RawVariant> } | null }>(
      "getProductByHandle:variants",
      PRODUCT_VARIANTS_QUERY,
      { handle, first: EXTRA_VARIANTS_PAGE_SIZE, after: endCursor },
      tags
    )
    if (!more.product) break
    variants.push(...more.product.variants.nodes)
    ;({ hasNextPage, endCursor } = more.product.variants.pageInfo)
  }

  return normalizeProduct({ ...rest, variants: { nodes: variants } })
}
