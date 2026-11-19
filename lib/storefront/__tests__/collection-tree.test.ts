import { beforeEach, describe, expect, it, vi } from "vitest"
import { CACHE_TAGS, REVALIDATE_SECONDS } from "../cache"
import { gqlData, rawCollection, sentRequests, stubFetch, stubShopifyEnv } from "./helpers"

async function loadTree() {
  vi.resetModules()
  const [collections, errors] = await Promise.all([import("../collections"), import("../errors")])
  return { ...collections, ...errors }
}

function rawNode(handle: string, options: { parent?: string | null; products?: number } = {}) {
  return {
    ...rawCollection({ id: `gid://shopify/Collection/${handle}`, handle, title: handle }),
    parent: options.parent === undefined || options.parent === null ? null : { value: options.parent },
    products: { nodes: Array.from({ length: options.products ?? 1 }, (_, i) => ({ id: `gid://shopify/Product/${i}` })) },
  }
}

const respond = (...nodes: ReturnType<typeof rawNode>[]) => stubFetch(() => gqlData({ collections: { nodes } }))

beforeEach(() => {
  stubShopifyEnv()
  vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("getCollectionTree", () => {
  it("reads custom.parent_collection and product presence, and groups the result", async () => {
    respond(
      rawNode("paws-and-claws", { products: 0 }),
      rawNode("turtley-apparel", { parent: "paws-and-claws", products: 9 }),
      rawNode("turtley-decals", { parent: "paws-and-claws", products: 0 }),
      rawNode("mama", { products: 2 }),
      rawNode("dads", { products: 0 })
    )
    const { getCollectionTree } = await loadTree()
    const tree = await getCollectionTree()

    expect(tree.groups.map((g) => [g.parent.handle, g.children.map((c) => c.handle)])).toEqual([
      ["paws-and-claws", ["turtley-apparel"]],
    ])
    expect(tree.flat.map((c) => c.handle)).toEqual(["mama"])
  })

  it("asks for the metafield and one product per collection, keeping the 5-minute cache and tags", async () => {
    const fetchMock = respond(rawNode("mama"))
    const { getCollectionTree } = await loadTree()
    await getCollectionTree()

    const [request] = sentRequests(fetchMock)
    expect(request.query).toContain('metafield(namespace: "custom", key: "parent_collection")')
    expect(request.query).toContain("products(first: 1)")
    expect(request.next).toEqual({ revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.collections, CACHE_TAGS.products] })
  })

  it("ignores blank parent values", async () => {
    respond(rawNode("mama", { parent: "  " }))
    const { getCollectionTree } = await loadTree()
    expect((await getCollectionTree()).flat.map((c) => c.handle)).toEqual(["mama"])
  })

  it("throws a clear config error when the parent exists but nothing points at it (metafield unset or not exposed)", async () => {
    respond(rawNode("paws-and-claws"), rawNode("turtley-apparel"), rawNode("mama"))
    const { getCollectionTree, ShopifyConfigError } = await loadTree()

    const error = await getCollectionTree().catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ShopifyConfigError)
    expect((error as Error).message).toContain("custom.parent_collection")
    expect((error as Error).message).toContain("PUBLIC_READ")
  })

  it("does not throw while the parent collection doesn't exist yet", async () => {
    respond(rawNode("mama"), rawNode("turtley-apparel"))
    const { getCollectionTree } = await loadTree()
    expect((await getCollectionTree()).flat).toHaveLength(2)
  })
})
