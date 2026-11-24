import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Product } from "@/lib/storefront/types"

const getProductByHandle = vi.hoisted(() => vi.fn())
const getCollectionByHandle = vi.hoisted(() => vi.fn())
vi.mock("@/lib/storefront", () => ({ getProductByHandle, getCollectionByHandle }))
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND")
  },
}))

const product = { id: "p1", title: "Tote", handle: "tote", options: [], variants: [] } as unknown as Product

async function renderPage(collection = "apparel-1") {
  const { default: ProductPage } = await import("../page")
  const element = await ProductPage({
    params: Promise.resolve({ collection, product: "tote" }),
    searchParams: Promise.resolve({}),
  })
  return element.props as { product: Product; collection: { handle: string; title: string } | null }
}

beforeEach(() => {
  getProductByHandle.mockReset().mockResolvedValue(product)
  getCollectionByHandle.mockReset()
})

describe("product page collection", () => {
  it("passes Shopify's collection title (not one made from the URL handle)", async () => {
    getCollectionByHandle.mockResolvedValue({ handle: "apparel-1", title: "Apparel", products: { items: [] } })
    const props = await renderPage("apparel-1")
    expect(props.collection).toEqual({ handle: "apparel-1", title: "Apparel" })
  })

  it("looks the collection up with the storefront lookup, asking for one product only", async () => {
    getCollectionByHandle.mockResolvedValue({ handle: "apparel-1", title: "Apparel", products: { items: [] } })
    await renderPage("apparel-1")
    expect(getCollectionByHandle).toHaveBeenCalledWith("apparel-1", { first: 1 })
  })

  it("passes null when Shopify has no such collection, and still renders the product", async () => {
    getCollectionByHandle.mockResolvedValue(null)
    const props = await renderPage("no-such-collection")
    expect(props.collection).toBeNull()
    expect(props.product).toBe(product)
  })

  it("is a 404 when the product doesn't exist, whatever the collection is", async () => {
    getProductByHandle.mockResolvedValue(null)
    getCollectionByHandle.mockResolvedValue({ handle: "apparel-1", title: "Apparel", products: { items: [] } })
    await expect(renderPage()).rejects.toThrow("NEXT_NOT_FOUND")
  })
})

describe("product page metadata", () => {
  const full = (overrides: Record<string, unknown> = {}) =>
    ({
      ...product,
      description: "Soft tee",
      featuredImage: { url: "https://cdn.shopify.com/t.jpg", altText: null, width: 1000, height: 1000 },
      collections: [
        { id: "c1", title: "Turtley Awesome Merch", handle: "turtley-awesome-merch" },
        { id: "c2", title: "Apparel", handle: "apparel-1" },
      ],
      ...overrides,
    }) as unknown as Product

  async function metadata(collection = "apparel-1") {
    const { generateMetadata } = await import("../page")
    return generateMetadata({ params: Promise.resolve({ collection, product: "tote" }), searchParams: Promise.resolve({}) })
  }

  it("uses Shopify's title and description; the layout adds the brand to the title once", async () => {
    getProductByHandle.mockResolvedValue(full())
    expect(await metadata()).toMatchObject({ title: "Tote", description: "Soft tee" })
  })

  it("leaves the description out when Shopify has none, so the site description stays", async () => {
    getProductByHandle.mockResolvedValue(full({ description: "" }))
    expect(await metadata()).not.toHaveProperty("description")
  })

  it("points the canonical and og:url at the product's first collection, whichever collection URL was visited", async () => {
    getProductByHandle.mockResolvedValue(full())
    const result = await metadata("apparel-1")
    expect(result.alternates).toEqual({ canonical: "/shop/turtley-awesome-merch/tote" })
    expect(result.openGraph).toMatchObject({ url: "/shop/turtley-awesome-merch/tote" })
  })

  it("percent-encodes an emoji handle in the canonical", async () => {
    getProductByHandle.mockResolvedValue(full({ handle: "sip-big-🐢" }))
    expect((await metadata()).alternates?.canonical).toBe("/shop/turtley-awesome-merch/sip-big-%F0%9F%90%A2")
  })

  it("shares the product photo, keeping the shared Open Graph fields", async () => {
    getProductByHandle.mockResolvedValue(full())
    expect((await metadata()).openGraph).toMatchObject({
      siteName: "HoneyBee Designs",
      images: [{ url: "https://cdn.shopify.com/t.jpg", alt: "Tote", width: 1000, height: 1000 }],
    })
  })

  it("keeps the shared logo when the product has no photo", async () => {
    getProductByHandle.mockResolvedValue(full({ featuredImage: null }))
    expect((await metadata()).openGraph?.images).toEqual([expect.objectContaining({ url: "/images/logo.png" })])
  })

  it("is a 404 when the product doesn't exist", async () => {
    getProductByHandle.mockResolvedValue(null)
    await expect(metadata()).rejects.toThrow("NEXT_NOT_FOUND")
  })
})
