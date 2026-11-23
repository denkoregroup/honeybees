import { describe, expect, it } from "vitest"
import {
  MAX_QUANTITY,
  MAX_REQUESTED_COLOR,
  parseCartId,
  parseLineId,
  parseQuantity,
  parseRequestedColor,
  parseVariantId,
  trimmedColor,
  typedColor,
} from "../cart-input"

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

describe("requested color", () => {
  it("trims and accepts 1 to 40 characters", () => {
    expect(parseRequestedColor("  Forest green ")).toBe("Forest green")
    expect(parseRequestedColor("a")).toBe("a")
    expect(parseRequestedColor("x".repeat(MAX_REQUESTED_COLOR))).toHaveLength(MAX_REQUESTED_COLOR)
  })

  it.each([
    ["empty", ""],
    ["only spaces", "   "],
    ["41 characters", "x".repeat(MAX_REQUESTED_COLOR + 1)],
    ["a line break", "Forest\ngreen"],
    ["a tab", "Forest\tgreen"],
    ["not a string", 42],
    ["null", null],
  ])("rejects %s", (_name, value) => {
    expect(parseRequestedColor(value)).toBeNull()
  })

  it("keeps markup as plain text; it is only ever escaped when shown", () => {
    expect(parseRequestedColor("<b>Red</b>")).toBe("<b>Red</b>")
  })

  it("drops leading spaces and cuts to 40 while typing, but keeps spaces inside and after a word", () => {
    expect(typedColor("   Forest ")).toBe("Forest ")
    expect(typedColor("x".repeat(60))).toHaveLength(MAX_REQUESTED_COLOR)
  })

  it("trims fully for sending", () => {
    expect(trimmedColor("  Forest green  ")).toBe("Forest green")
    expect(trimmedColor("    ")).toBe("")
  })
})
