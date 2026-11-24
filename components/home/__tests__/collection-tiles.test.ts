import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  gqlData,
  rawCollection,
  rawImage,
  rawSummary,
  sentRequests,
  stubFetch,
  stubShopifyEnv,
} from "@/lib/storefront/__tests__/helpers"
import { CATEGORIES } from "../categories"
import type { CollectionTile } from "../collection-tiles"

async function loadTiles() {
  vi.resetModules()
  return import("../collection-tiles")
}

beforeEach(() => {
  stubShopifyEnv()
  vi.spyOn(console, "error").mockImplementation(() => {})
})

const page = <T>(nodes: T[]) => ({ nodes, pageInfo: { hasNextPage: false, endCursor: null } })
const collectionPhoto = rawImage({ url: "https://cdn.shopify.com/s/files/1/collection.png" })
const productPhoto = rawImage({ url: "https://cdn.shopify.com/s/files/1/product.png" })

describe("getCategoryTiles", () => {
  it("prefers the collection image, falls back to the first product's photo, and drops missing or empty collections", async () => {
    const [withImage, withoutImage, missing, empty, noPhotos] = CATEGORIES.map((c) => c.handle)
    const fetchMock = stubFetch(({ variables }) => {
      const handle = String(variables.handle)
      const collection = (image: ReturnType<typeof rawImage> | null, products: ReturnType<typeof rawSummary>[]) =>
        gqlData({ collection: { ...rawCollection({ handle, title: `Title ${handle}`, image }), products: page(products) } })
      if (handle === withImage) return collection(collectionPhoto, [rawSummary({ featuredImage: productPhoto })])
      if (handle === withoutImage) return collection(null, [rawSummary({ featuredImage: productPhoto })])
      if (handle === missing) return gqlData({ collection: null })
      if (handle === empty) return collection(collectionPhoto, [])
      if (handle === noPhotos) return collection(null, [rawSummary({ featuredImage: null })])
      throw new Error(`unexpected handle ${handle}`)
    })
    const { getCategoryTiles } = await loadTiles()
    const tiles = await getCategoryTiles()

    expect(tiles.map((t) => t.handle)).toEqual([withImage, withoutImage, noPhotos])
    expect(tiles[0]).toMatchObject({ name: CATEGORIES[0].name, handle: withImage })
    expect(tiles.map((t) => t.image?.url ?? null)).toEqual([collectionPhoto.url, productPhoto.url, null])
    expect(sentRequests(fetchMock).map((r) => r.variables.first)).toEqual(CATEGORIES.map(() => 1))
  })
})

describe("getShopCollectionTiles", () => {
  const listed = (handle: string, image: ReturnType<typeof rawImage> | null, firstProduct: ReturnType<typeof rawImage> | null) => ({
    ...rawCollection({ id: `gid://shopify/Collection/${handle}`, handle, title: `Title ${handle}`, image }),
    products: { nodes: [{ featuredImage: firstProduct }] },
  })

  it("leaves out the category-row collections and empty ones, keeps up to six, and picks each tile's image", async () => {
    stubFetch(() =>
      gqlData({
        collections: page([
          listed(CATEGORIES[0].handle, collectionPhoto, null),
          listed("turtley-apparel", collectionPhoto, productPhoto),
          listed("accessories", null, productPhoto),
          listed("car-accessories", null, null),
          { ...listed("empty", collectionPhoto, null), products: { nodes: [] } },
          listed(CATEGORIES[1].handle, collectionPhoto, null),
          ...["a", "b", "c", "d"].map((h) => listed(h, null, null)),
        ]),
      })
    )
    const { getShopCollectionTiles, SHOP_COLLECTIONS_MAX } = await loadTiles()
    const tiles = await getShopCollectionTiles()

    expect(tiles).toHaveLength(SHOP_COLLECTIONS_MAX)
    expect(tiles.map((t) => t.handle)).toEqual(["turtley-apparel", "accessories", "car-accessories", "a", "b", "c"])
    expect(tiles[0]).toMatchObject({ name: "Title turtley-apparel", handle: "turtley-apparel" })
    expect(tiles.slice(0, 3).map((t) => t.image?.url ?? null)).toEqual([collectionPhoto.url, productPhoto.url, null])
  })

  it("returns no tiles when only category-row collections are live", async () => {
    stubFetch(() => gqlData({ collections: page(CATEGORIES.map(({ handle }) => listed(handle, collectionPhoto, null))) }))
    const { getShopCollectionTiles } = await loadTiles()
    expect(await getShopCollectionTiles()).toEqual([])
  })
})

describe("ShopCollections", () => {
  async function render(tiles: CollectionTile[]) {
    const { ShopCollections } = await import("../ShopCollections")
    return renderToStaticMarkup(createElement(ShopCollections, { tiles }))
  }

  it("renders nothing when there are no tiles", async () => {
    expect(await render([])).toBe("")
  })

  it("links each tile to its collection and shows its photo, or a plain surface without one", async () => {
    const html = await render([
      { name: "Turtley Apparel", handle: "turtley-apparel", image: { url: collectionPhoto.url, altText: null, width: 800, height: 600 } },
      { name: "Accessories", handle: "accessories", image: null },
    ])
    expect([...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1])).toEqual(["/shop/turtley-apparel", "/shop/accessories"])
    const imgs = html.match(/<img\b[^>]*>/g) ?? []
    expect(imgs).toHaveLength(1)
    expect(imgs[0]).toContain('alt=""')
    expect(html).toContain("grid-cols-2")
  })
})
