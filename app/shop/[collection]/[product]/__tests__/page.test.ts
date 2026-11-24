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
