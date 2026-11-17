import { describe, expect, it } from "vitest"
import { MAX_QUANTITY, parseCartId, parseLineId, parseQuantity, parseVariantId } from "../cart-input"

describe("parseVariantId", () => {
  it("accepts a Shopify ProductVariant gid", () => {
    expect(parseVariantId("gid://shopify/ProductVariant/12345")).toBe("gid://shopify/ProductVariant/12345")
  })

  it.each([
    "",
    "12345",
    "gid://shopify/Product/12345",
    "gid://shopify/ProductVariant/",
    "gid://shopify/ProductVariant/abc",
    "gid://shopify/ProductVariant/1 OR 1=1",
    "https://example.com/gid://shopify/ProductVariant/1",
    123,
    null,
    undefined,
    { id: "gid://shopify/ProductVariant/1" },
  ])("rejects %j", (value) => {
    expect(parseVariantId(value)).toBeNull()
  })
})

describe("parseQuantity", () => {
  it("accepts integers from 1 to the maximum when adding", () => {
    expect(parseQuantity(1, 1)).toBe(1)
    expect(parseQuantity(MAX_QUANTITY, 1)).toBe(MAX_QUANTITY)
    expect(MAX_QUANTITY).toBe(99)
  })

  it("rejects 0 when adding, but allows it when updating (it removes the line)", () => {
    expect(parseQuantity(0, 1)).toBeNull()
    expect(parseQuantity(0, 0)).toBe(0)
  })

  it.each([100, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, "2", null, undefined, [2]])("rejects %j", (value) => {
    expect(parseQuantity(value, 0)).toBeNull()
  })
})

describe("parseLineId and parseCartId", () => {
  it("accept Shopify ids, including the query part Shopify puts in them", () => {
    expect(parseLineId("gid://shopify/CartLine/abc-1?cart=token")).not.toBeNull()
    expect(parseCartId("gid://shopify/Cart/token?key=secret")).not.toBeNull()
  })

  it.each(["", "abc", "gid://shopify/CartLine/", "gid://shopify/Cart/token", 5, undefined])(
    "reject %j as a line id",
    (value) => {
      expect(parseLineId(value)).toBeNull()
    }
  )

  it.each(["", "not-a-cart", "gid://shopify/Cart/", "gid://shopify/ProductVariant/1", null, undefined])(
    "reject %j as a cart id",
    (value) => {
      expect(parseCartId(value)).toBeNull()
    }
  )
})
