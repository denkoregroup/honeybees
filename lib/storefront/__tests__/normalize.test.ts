import { describe, expect, it } from "vitest"
import {
  normalizeCollection,
  normalizeCollectionWithProducts,
  normalizePage,
  normalizeProduct,
  normalizeProductSummary,
} from "../normalize"
import { rawCollection, rawImage, rawProduct, rawSummary, rawVariant } from "./helpers"

const range = (min: string, max: string) => ({
  minVariantPrice: { amount: min, currencyCode: "USD" },
  maxVariantPrice: { amount: max, currencyCode: "USD" },
})

describe("compareAtPriceRange", () => {
  it("is null when Shopify reports a compare-at price of 0", () => {
    const summary = normalizeProductSummary(rawSummary({ compareAtPriceRange: range("0.0", "0.0") }))
    expect(summary.compareAtPriceRange).toBeNull()
  })

  it("is kept, as Money strings, when a variant has a compare-at price", () => {
    const summary = normalizeProductSummary(rawSummary({ compareAtPriceRange: range("0.0", "39.99") }))
    expect(summary.compareAtPriceRange).toEqual({
      min: { amount: "0.0", currencyCode: "USD" },
      max: { amount: "39.99", currencyCode: "USD" },
    })
  })
})

describe("prices", () => {
  it("keeps amounts as strings", () => {
    const summary = normalizeProductSummary(rawSummary())
    expect(summary.priceRange.min).toEqual({ amount: "24.99", currencyCode: "USD" })
    expect(summary.priceRange.max).toEqual({ amount: "29.99", currencyCode: "USD" })
  })
})

describe("images", () => {
  it("maps a null featuredImage to null", () => {
    expect(normalizeProductSummary(rawSummary({ featuredImage: null })).featuredImage).toBeNull()
  })

  it("keeps null altText, width and height as null", () => {
    const summary = normalizeProductSummary(
      rawSummary({ featuredImage: rawImage({ altText: null, width: null, height: null }) })
    )
    expect(summary.featuredImage).toEqual({
      url: "https://cdn.example.com/image.png",
      altText: null,
      width: null,
      height: null,
    })
  })

  it("maps product images from nodes", () => {
    const product = normalizeProduct(rawProduct({ images: { nodes: [rawImage(), rawImage({ url: "https://cdn.example.com/b.png" })] } }))
    expect(product.images.map((i) => i.url)).toEqual([
      "https://cdn.example.com/image.png",
      "https://cdn.example.com/b.png",
    ])
  })
})

describe("variants and options", () => {
  it("maps a null variant image to null and keeps a present one", () => {
    const product = normalizeProduct(
      rawProduct({}, [rawVariant(0, { image: null }), rawVariant(1, { image: rawImage({ altText: null }) })])
    )
    expect(product.variants[0].image).toBeNull()
    expect(product.variants[1].image).toMatchObject({ url: "https://cdn.example.com/image.png", altText: null })
  })

  it("maps variant compareAtPrice to null or Money", () => {
    const product = normalizeProduct(
      rawProduct({}, [
        rawVariant(0),
        rawVariant(1, { compareAtPrice: { amount: "39.99", currencyCode: "USD" } }),
      ])
    )
    expect(product.variants[0].compareAtPrice).toBeNull()
    expect(product.variants[1].compareAtPrice).toEqual({ amount: "39.99", currencyCode: "USD" })
  })

  it("maps option values to their names", () => {
    const product = normalizeProduct(rawProduct())
    expect(product.options).toEqual([{ name: "Size", values: ["20oz", "30oz"] }])
  })

  it("keeps selectedOptions and availability", () => {
    const product = normalizeProduct(rawProduct({}, [rawVariant(3, { availableForSale: false })]))
    expect(product.variants[0]).toMatchObject({
      id: "gid://shopify/ProductVariant/3",
      availableForSale: false,
      selectedOptions: [{ name: "Size", value: "S3" }],
    })
  })
})

describe("ProductSummary vs Product", () => {
  const SUMMARY_KEYS = [
    "availableForSale",
    "compareAtPriceRange",
    "featuredImage",
    "handle",
    "id",
    "priceRange",
    "tags",
    "title",
  ]

  it("a summary has only card fields", () => {
    expect(Object.keys(normalizeProductSummary(rawSummary())).sort()).toEqual(SUMMARY_KEYS)
  })

  it("a product has the summary fields plus detail fields", () => {
    const product = normalizeProduct(rawProduct())
    expect(Object.keys(product).sort()).toEqual(
      [...SUMMARY_KEYS, "collections", "description", "descriptionHtml", "images", "options", "variants"].sort()
    )
    expect(product.collections).toEqual([
      { id: "gid://shopify/Collection/1", title: "Drinkware", handle: "drinkware" },
    ])
  })

  it("normalizing a full product as a summary drops detail fields", () => {
    const summary = normalizeProductSummary(rawProduct())
    expect(Object.keys(summary).sort()).toEqual(SUMMARY_KEYS)
  })
})

describe("normalizePage", () => {
  it("keeps a null endCursor as null", () => {
    const page = normalizePage({ nodes: [1, 2], pageInfo: { hasNextPage: false, endCursor: null } }, (n) => n * 2)
    expect(page).toEqual({ items: [2, 4], pageInfo: { hasNextPage: false, endCursor: null } })
  })

  it("keeps hasNextPage and a cursor", () => {
    const page = normalizePage({ nodes: [], pageInfo: { hasNextPage: true, endCursor: "abc" } }, (n) => n)
    expect(page.pageInfo).toEqual({ hasNextPage: true, endCursor: "abc" })
    expect(page.items).toEqual([])
  })
})

describe("collections", () => {
  it("maps a null collection image to null", () => {
    expect(normalizeCollection(rawCollection({ image: null })).image).toBeNull()
  })

  it("normalizes a collection's products as summaries with page info", () => {
    const result = normalizeCollectionWithProducts({
      ...rawCollection(),
      products: { nodes: [rawSummary()], pageInfo: { hasNextPage: true, endCursor: "next" } },
    })
    expect(result.handle).toBe("drinkware")
    expect(result.products.pageInfo).toEqual({ hasNextPage: true, endCursor: "next" })
    expect(Object.keys(result.products.items[0])).not.toContain("variants")
  })
})
