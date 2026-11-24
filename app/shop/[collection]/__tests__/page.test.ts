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

const image = (url: string, altText: string | null = null) => ({ url, altText, width: 800, height: 600 })
const collection = (overrides: Record<string, unknown> = {}) => ({
  handle: "apparel-1",
  title: "Apparel",
  description: "Tees",
  image: null,
  products: { items: [] },
  ...overrides,
})

describe("collection page with a real collection", () => {
  it("uses Shopify's title and description; the layout adds the brand to the title once", async () => {
    getCollectionByHandle.mockResolvedValue(collection())
    const { generateMetadata } = await import("../page")
    const metadata = await generateMetadata(params("apparel-1"))
    expect(metadata.title).toBe("Apparel")
    expect(metadata.description).toBe("Tees")
  })

  it("leaves the description out when Shopify has none, so the site description stays", async () => {
    getCollectionByHandle.mockResolvedValue(collection({ description: "" }))
    const { generateMetadata } = await import("../page")
    expect(await generateMetadata(params("apparel-1"))).not.toHaveProperty("description")
  })

  it("shares the collection photo, keeping the shared Open Graph fields", async () => {
    getCollectionByHandle.mockResolvedValue(collection({ image: image("https://cdn.shopify.com/c.jpg", "Tees on a rack") }))
    const { generateMetadata } = await import("../page")
    expect((await generateMetadata(params("apparel-1"))).openGraph).toMatchObject({
      siteName: "HoneyBee Designs",
      images: [{ url: "https://cdn.shopify.com/c.jpg", alt: "Tees on a rack", width: 800, height: 600 }],
    })
  })

  it("shares the first product's photo when the collection has none", async () => {
    getCollectionByHandle.mockResolvedValue(
      collection({ products: { items: [{ featuredImage: image("https://cdn.shopify.com/p.jpg") }] } })
    )
    const { generateMetadata } = await import("../page")
    expect((await generateMetadata(params("apparel-1"))).openGraph?.images).toEqual([
      { url: "https://cdn.shopify.com/p.jpg", alt: "Apparel", width: 800, height: 600 },
    ])
  })

  it("keeps the shared logo when there is no photo at all", async () => {
    getCollectionByHandle.mockResolvedValue(collection())
    const { generateMetadata } = await import("../page")
    expect((await generateMetadata(params("apparel-1"))).openGraph?.images).toEqual([
      expect.objectContaining({ url: "/images/logo.png" }),
    ])
  })
})
