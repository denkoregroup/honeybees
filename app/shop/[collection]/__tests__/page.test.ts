import { beforeEach, describe, expect, it, vi } from "vitest"

const getCollectionByHandle = vi.hoisted(() => vi.fn())
vi.mock("@/lib/storefront", () => ({ getCollectionByHandle }))
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND")
  },
}))

const params = (collection: string) => ({ params: Promise.resolve({ collection }) })

beforeEach(() => {
  getCollectionByHandle.mockReset().mockResolvedValue(null)
})

describe("collection page with a handle Shopify doesn't have", () => {
  it("is a 404", async () => {
    const { default: CollectionPage } = await import("../page")
    await expect(CollectionPage(params("no-such-collection"))).rejects.toThrow("NEXT_NOT_FOUND")
    expect(getCollectionByHandle).toHaveBeenCalledWith("no-such-collection", { first: 250 })
  })

  it("is a 404 for its metadata too", async () => {
    const { generateMetadata } = await import("../page")
    await expect(generateMetadata(params("no-such-collection"))).rejects.toThrow("NEXT_NOT_FOUND")
  })
})

describe("collection page with a real collection", () => {
  it("uses Shopify's title for the metadata", async () => {
    getCollectionByHandle.mockResolvedValue({ handle: "apparel-1", title: "Apparel", description: "Tees", products: { items: [] } })
    const { generateMetadata } = await import("../page")
    expect(await generateMetadata(params("apparel-1"))).toEqual({ title: "Apparel | HoneyBee Designs", description: "Tees" })
  })
})
