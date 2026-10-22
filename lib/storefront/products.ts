import "server-only"

import { CACHE_TAGS } from "./cache"
import { storefrontRequest } from "./client"
import { normalizePage, normalizeProduct, type RawConnection, type RawProduct } from "./normalize"
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY } from "./queries"
import type { Page, PageArgs, Product } from "./types"
import { pageVariables } from "./pagination"

export async function getProducts(args: PageArgs = {}): Promise<Page<Product>> {
  const data = await storefrontRequest<{ products: RawConnection<RawProduct> }>(
    "getProducts",
    PRODUCTS_QUERY,
    pageVariables(args, 24),
    [CACHE_TAGS.products]
  )
  return normalizePage(data.products, normalizeProduct)
}

/** Returns null when the handle doesn't exist or the product isn't published to this storefront. */
export async function getProductByHandle(handle: string): Promise<Product | null> {
  if (!handle.trim()) return null
  const data = await storefrontRequest<{ product: RawProduct | null }>(
    "getProductByHandle",
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
    [CACHE_TAGS.products, CACHE_TAGS.product(handle)]
  )
  return data.product ? normalizeProduct(data.product) : null
}
