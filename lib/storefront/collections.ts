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

/**
 * Collections that have at least one product (the list query peeks at one product per collection).
 * Empty ones are dropped after the fetch, so a page can hold fewer than `first` items even when
 * `hasNextPage` is true; the only caller asks for the largest page and has no pagination UI.
 */
export async function getCollections(args: PageArgs = {}): Promise<Page<Collection>> {
  const data = await storefrontRequest<{
    collections: RawConnection<RawCollection & { products: { nodes: unknown[] } }>
  }>("getCollections", COLLECTIONS_QUERY, pageVariables(args, 20), [CACHE_TAGS.collections])
  const nonEmpty = { ...data.collections, nodes: data.collections.nodes.filter((c) => c.products.nodes.length > 0) }
  return normalizePage(nonEmpty, normalizeCollection)
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
