import { getCollectionByHandle, getCollections, type Image } from "@/lib/storefront"
import { CATEGORIES } from "./categories"

export interface CollectionTile {
  /** Text under or on the tile. */
  name: string
  handle: string
  /**
   * Collection image, else the first product's photo; null when Shopify has neither. Decorative (empty
   * alt): the name is the tile's text, in the same link.
   */
  image: Image | null
}

export const SHOP_COLLECTIONS_MAX = 6

/** The curated categories that exist and have products, in CATEGORIES order. */
export async function getCategoryTiles(): Promise<CollectionTile[]> {
  const collections = await Promise.all(CATEGORIES.map(({ handle }) => getCollectionByHandle(handle, { first: 1 })))
  return CATEGORIES.flatMap(({ name, handle }, i) => {
    const collection = collections[i]
    const firstProduct = collection?.products.items[0]
    if (!collection || !firstProduct) return []
    return [{ name, handle, image: collection.image ?? firstProduct.featuredImage }]
  })
}

/** Other non-empty collections, so the desktop page doesn't show the category row twice. */
export async function getShopCollectionTiles(): Promise<CollectionTile[]> {
  const curated = new Set(CATEGORIES.map(({ handle }) => handle))
  // Same arguments as the /collections page, so both share one cached request.
  const collections = await getCollections({ first: 250 })
  return collections.items
    .filter(({ handle }) => !curated.has(handle))
    .slice(0, SHOP_COLLECTIONS_MAX)
    .map(({ title, handle, image, firstProductImage }) => ({
      name: title,
      handle,
      image: image ?? firstProductImage,
    }))
}
