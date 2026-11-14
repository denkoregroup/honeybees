import "server-only"

import { CACHE_TAGS } from "./cache"
import { storefrontRequest } from "./client"
import {
  normalizeCollection,
  normalizeCollectionWithProducts,
  normalizePage,
  type RawCollection,
  type RawConnection,
  type RawProductSummary,
} from "./normalize"
import { pageVariables } from "./pagination"
import { COLLECTIONS_QUERY, COLLECTION_BY_HANDLE_QUERY } from "./queries"
import type { Collection, CollectionWithProducts, Page, PageArgs } from "./types"

export async function getCollections(args: PageArgs = {}): Promise<Page<Collection>> {
  const data = await storefrontRequest<{ collections: RawConnection<RawCollection> }>(
    "getCollections",
    COLLECTIONS_QUERY,
    pageVariables(args, 20),
    [CACHE_TAGS.collections]
  )
  return normalizePage(data.collections, normalizeCollection)
}

/** Returns null when the handle doesn't exist or the collection isn't published to this storefront. */
export async function getCollectionByHandle(
  handle: string,
  args: PageArgs = {}
): Promise<CollectionWithProducts | null> {
  if (!handle.trim()) return null
  const data = await storefrontRequest<{
    collection: (RawCollection & { products: RawConnection<RawProductSummary> }) | null
  }>(
    "getCollectionByHandle",
    COLLECTION_BY_HANDLE_QUERY,
    { handle, ...pageVariables(args, 24) },
    // products tag too: a product edit should refresh the collection listing that contains it
    [CACHE_TAGS.collections, CACHE_TAGS.collection(handle), CACHE_TAGS.products]
  )
  return data.collection ? normalizeCollectionWithProducts(data.collection) : null
}
