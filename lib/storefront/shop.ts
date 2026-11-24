import "server-only"

import { CACHE_TAGS } from "./cache"
import { storefrontRequest } from "./client"
import { normalizeShopPolicies, type RawShopPolicies } from "./normalize"
import { SHOP_POLICIES_QUERY } from "./queries"
import type { ShopPolicy } from "./types"

/** The store policies that exist in Shopify, each with its Shopify-hosted URL. */
export async function getShopPolicies(): Promise<ShopPolicy[]> {
  const data = await storefrontRequest<{ shop: RawShopPolicies }>(
    "getShopPolicies",
    SHOP_POLICIES_QUERY,
    {},
    [CACHE_TAGS.policies]
  )
  return normalizeShopPolicies(data.shop)
}
