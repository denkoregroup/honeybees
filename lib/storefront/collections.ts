import "server-only"

import { CACHE_TAGS } from "./cache"
import { storefrontRequest } from "./client"
import { ShopifyConfigError } from "./errors"
import { PARENT_COLLECTION_HANDLE, groupCollections } from "./hierarchy"
import {
  normalizeCollection,
  normalizeCollectionNode,
  normalizeCollectionWithProducts,
  normalizePage,
  type RawCollectionNode,
  type RawCollection,
  type RawConnection,
  type RawProductSummary,
} from "./normalize"
import { pageVariables } from "./pagination"
import { COLLECTIONS_QUERY, COLLECTION_BY_HANDLE_QUERY, COLLECTION_HIERARCHY_QUERY } from "./queries"
import type { Collection, CollectionTree, CollectionWithProducts, Page, PageArgs } from "./types"

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

/** Largest page the Storefront API allows; the store has well under this many collections. */
const HIERARCHY_PAGE_SIZE = 250

/**
 * Every collection, grouped under parents (see `groupCollections`), with empty ones hidden.
 * Reads the `custom.parent_collection` metafield, which only appears in Storefront API responses when its
 * definition has Storefront access set to PUBLIC_READ. A missing or hidden metafield reads as "no parent",
 * so when the parent collection exists but nothing points at it, this throws instead of silently
 * rendering a flat list.
 */
export async function getCollectionTree(): Promise<CollectionTree> {
  const data = await storefrontRequest<{ collections: { nodes: RawCollectionNode[] } }>(
    "getCollectionTree",
    COLLECTION_HIERARCHY_QUERY,
    { first: HIERARCHY_PAGE_SIZE },
    [CACHE_TAGS.collections, CACHE_TAGS.products]
  )
  const nodes = data.collections.nodes.map(normalizeCollectionNode)

  const parentExists = nodes.some((n) => n.handle === PARENT_COLLECTION_HANDLE)
  const hasChildren = nodes.some((n) => n.parentHandle === PARENT_COLLECTION_HANDLE)
  if (parentExists && !hasChildren) {
    throw new ShopifyConfigError(
      `Collection "${PARENT_COLLECTION_HANDLE}" exists but no collection names it in custom.parent_collection. ` +
        "Either no child collections are assigned yet, or the metafield definition does not have Storefront " +
        "access set to PUBLIC_READ (Shopify Admin: Settings, Custom data, Collections, parent_collection)."
    )
  }

  return groupCollections(nodes)
}
