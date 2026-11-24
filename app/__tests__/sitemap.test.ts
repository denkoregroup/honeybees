import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ProductSummary } from "@/lib/storefront/types"

const getProducts = vi.hoisted(() => vi.fn())
const getCollections = vi.hoisted(() => vi.fn())
vi.mock("@/lib/storefront", () => ({ getProducts, getCollections }))

const page = <T,>(items: T[]) => ({ items, pageInfo: { hasNextPage: false, endCursor: null } })
const ref = (handle: string) => ({ id: `c-${handle}`, title: handle, handle })
const product = (handle: string, collections: string[]) =>
  ({
    id: `p-${handle}`,
    title: handle,
    handle,
    tags: [],
    availableForSale: true,
    featuredImage: null,
    priceRange: { min: { amount: "10.0", currencyCode: "USD" }, max: { amount: "10.0", currencyCode: "USD" } },
    compareAtPriceRange: null,
    collections: collections.map(ref),
  }) satisfies ProductSummary

async function urls() {
  vi.resetModules()
  const { default: sitemap } = await import("../sitemap")
  return (await sitemap()).map((entry) => entry.url)
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined)
  getProducts.mockReset().mockResolvedValue(page([]))
  getCollections.mockReset().mockResolvedValue(page([]))
})

describe("sitemap", () => {
  it("lists the static pages under the default site URL, but not the cart", async () => {
    expect(await urls()).toEqual([
      "https://honeybeedesigns.shop/",
      "https://honeybeedesigns.shop/shop",
      "https://honeybeedesigns.shop/collections",
      "https://honeybeedesigns.shop/about",
      "https://honeybeedesigns.shop/contact",
    ])
  })

  it("uses NEXT_PUBLIC_SITE_URL when it is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.test")
    expect(await urls()).toContain("https://example.test/shop")
  })

  it("asks for the same pages /shop and /collections show (empty collections are dropped by getCollections)", async () => {
    await urls()
    expect(getProducts).toHaveBeenCalledWith({ first: 250 })
    expect(getCollections).toHaveBeenCalledWith({ first: 250 })
  })

  it("lists each collection Shopify returns at /shop/[collection]", async () => {
    getCollections.mockResolvedValue(page([ref("apparel-1"), ref("turtley-decals")]))
    const list = await urls()
    expect(list).toContain("https://honeybeedesigns.shop/shop/apparel-1")
    expect(list).toContain("https://honeybeedesigns.shop/shop/turtley-decals")
  })

  it("lists a product once, under its first collection, even when it is in several", async () => {
    getProducts.mockResolvedValue(page([product("tote", ["turtley-awesome-merch", "apparel-1"])]))
    const products = (await urls()).filter((url) => url.endsWith("/tote"))
    expect(products).toEqual(["https://honeybeedesigns.shop/shop/turtley-awesome-merch/tote"])
  })

  it("lists a product in no collection under /shop/shop, as the product cards link it", async () => {
    getProducts.mockResolvedValue(page([product("loose", [])]))
    expect(await urls()).toContain("https://honeybeedesigns.shop/shop/shop/loose")
  })

  it("percent-encodes emoji and other non-ASCII handles", async () => {
    getCollections.mockResolvedValue(page([ref("café-🐝")]))
    getProducts.mockResolvedValue(page([product("shop-small-sip-big-🐢-copy-1", ["café-🐝"])]))
    const list = await urls()
    expect(list).toContain("https://honeybeedesigns.shop/shop/caf%C3%A9-%F0%9F%90%9D")
    expect(list).toContain("https://honeybeedesigns.shop/shop/caf%C3%A9-%F0%9F%90%9D/shop-small-sip-big-%F0%9F%90%A2-copy-1")
  })

  it("encodes characters that would otherwise change the URL", async () => {
    getProducts.mockResolvedValue(page([product("a?b#c/d", ["x&y"])]))
    expect(await urls()).toContain("https://honeybeedesigns.shop/shop/x%26y/a%3Fb%23c%2Fd")
  })

  it("gives the same product URL the product card links to", async () => {
    const p = product("shop-small-sip-big-🐢", ["turtley-awesome-merch", "apparel-1"])
    getProducts.mockResolvedValue(page([p]))
    const { ProductCard } = await import("@/components/features/ProductCard")
    const href = /href="([^"]*)"/.exec(renderToStaticMarkup(createElement(ProductCard, { product: p })))?.[1]
    const listed = (await urls()).find((url) => url.includes("sip-big"))
    expect(listed && decodeURI(new URL(listed).pathname)).toBe(href)
  })
})
