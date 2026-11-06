import { beforeEach, describe, expect, it, vi } from "vitest"
import { CACHE_TAGS } from "../cache"
import { gqlData, rawCollection, rawSummary, sentRequests, stubFetch, stubShopifyEnv } from "./helpers"

async function loadCollections() {
  vi.resetModules()
  return import("../collections")
}

beforeEach(() => {
  stubShopifyEnv()
  vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("getCollections", () => {
  it("returns collections with page info", async () => {
    const fetchMock = stubFetch(() =>
      gqlData({
        collections: {
          nodes: [rawCollection(), rawCollection({ id: "gid://shopify/Collection/2", handle: "keychains" })],
          pageInfo: { hasNextPage: true, endCursor: "cursor-2" },
        },
      })
    )
    const { getCollections } = await loadCollections()
    const page = await getCollections()

    expect(page.items.map((c) => c.handle)).toEqual(["drinkware", "keychains"])
    expect(page.pageInfo).toEqual({ hasNextPage: true, endCursor: "cursor-2" })
    const [request] = sentRequests(fetchMock)
    expect(request.variables).toEqual({ first: 20, after: null })
    expect(request.next?.tags).toEqual([CACHE_TAGS.collections])
  })

  it("rejects an invalid page size before making a request", async () => {
    const fetchMock = stubFetch(() => gqlData({}))
    const { getCollections } = await loadCollections()
    await expect(getCollections({ first: 251 })).rejects.toBeInstanceOf(RangeError)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe("getCollectionByHandle", () => {
  it("returns null for an unknown handle", async () => {
    const fetchMock = stubFetch(() => gqlData({ collection: null }))
    const { getCollectionByHandle } = await loadCollections()
    expect(await getCollectionByHandle("nope")).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it.each(["", "   "])("returns null for the empty handle %j without making a request", async (handle) => {
    const fetchMock = stubFetch(() => gqlData({ collection: null }))
    const { getCollectionByHandle } = await loadCollections()
    expect(await getCollectionByHandle(handle)).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("returns the collection with a page of product summaries", async () => {
    const fetchMock = stubFetch(() =>
      gqlData({
        collection: {
          ...rawCollection(),
          products: { nodes: [rawSummary()], pageInfo: { hasNextPage: true, endCursor: "cursor-1" } },
        },
      })
    )
    const { getCollectionByHandle } = await loadCollections()
    const collection = await getCollectionByHandle("drinkware", { first: 5, after: "cursor-0" })

    expect(collection?.title).toBe("Drinkware")
    expect(collection?.products.items.map((p) => p.handle)).toEqual(["bee-kind-tumbler"])
    expect(collection?.products.pageInfo).toEqual({ hasNextPage: true, endCursor: "cursor-1" })
    expect(Object.keys(collection!.products.items[0])).not.toContain("variants")

    const [request] = sentRequests(fetchMock)
    expect(request.variables).toEqual({ handle: "drinkware", first: 5, after: "cursor-0" })
    expect(request.next?.tags).toEqual([
      CACHE_TAGS.collections,
      CACHE_TAGS.collection("drinkware"),
      CACHE_TAGS.products,
    ])
  })
})
