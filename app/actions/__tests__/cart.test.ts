import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  CART_ID,
  CHECKOUT_URL,
  LINE_ID,
  NEW_CART_ID,
  VARIANT_ID,
  cartOperation,
  gqlData,
  jsonResponse,
  rawCart,
  sentRequests,
  stubFetch,
  stubShopifyEnv,
} from "@/lib/storefront/__tests__/helpers"

// An in-memory cookie jar standing in for next/headers.
const jar = vi.hoisted(() => new Map<string, string>())
const cookieSet = vi.hoisted(() => vi.fn())
const cookieDelete = vi.hoisted(() => vi.fn())
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    set: (name: string, value: string, options: unknown) => {
      cookieSet(name, value, options)
      jar.set(name, value)
    },
    delete: (name: string) => {
      cookieDelete(name)
      jar.delete(name)
    },
  }),
  headers: async () => new Headers(),
}))

const GENERIC_ERROR = "Something went wrong with your cart. Please try again."

async function loadActions() {
  vi.resetModules()
  return import("../cart")
}

function stubCartApi(handlers: Record<string, () => unknown> = {}) {
  return stubFetch((req) => {
    const operation = cartOperation(req.query) ?? ""
    if (handlers[operation]) return gqlData(handlers[operation]())
    switch (operation) {
      case "Cart":
        return gqlData({ cart: rawCart() })
      case "CartCreate":
        return gqlData({ cartCreate: { cart: rawCart(NEW_CART_ID, 1), userErrors: [] } })
      case "CartLinesAdd":
        return gqlData({ cartLinesAdd: { cart: rawCart(), userErrors: [] } })
      case "CartLinesUpdate":
        return gqlData({ cartLinesUpdate: { cart: rawCart(), userErrors: [] } })
      default:
        return gqlData({ cartLinesRemove: { cart: rawCart(CART_ID, 1), userErrors: [] } })
    }
  })
}

const operations = (fetchMock: ReturnType<typeof stubFetch>) =>
  sentRequests(fetchMock).map((r) => cartOperation(r.query))

beforeEach(() => {
  jar.clear()
  cookieSet.mockClear()
  cookieDelete.mockClear()
  stubShopifyEnv({ SHOPIFY_STOREFRONT_TOKEN_TYPE: "public" })
  vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("input validation", () => {
  it.each(["", "42", "gid://shopify/Product/42", "gid://shopify/ProductVariant/x", 42 as unknown as string])(
    "addToCart rejects the variant id %j without calling Shopify",
    async (variantId) => {
      const fetchMock = stubCartApi()
      const { addToCart } = await loadActions()
      expect(await addToCart(variantId, 1)).toEqual({ ok: false, error: GENERIC_ERROR })
      expect(fetchMock).not.toHaveBeenCalled()
    }
  )

  it.each([0, 100, -1, 1.5, Number.NaN, "2" as unknown as number])(
    "addToCart rejects the quantity %j without calling Shopify",
    async (quantity) => {
      const fetchMock = stubCartApi()
      const { addToCart } = await loadActions()
      expect(await addToCart(VARIANT_ID, quantity)).toEqual({ ok: false, error: GENERIC_ERROR })
      expect(fetchMock).not.toHaveBeenCalled()
    }
  )

  it.each([["bad-line", 1], [LINE_ID, 100], [LINE_ID, -1], [LINE_ID, 2.5]] as const)(
    "updateLine rejects %j, %j without calling Shopify",
    async (lineId, quantity) => {
      jar.set("cart", CART_ID)
      const fetchMock = stubCartApi()
      const { updateLine } = await loadActions()
      expect(await updateLine(lineId, quantity)).toEqual({ ok: false, error: GENERIC_ERROR })
      expect(fetchMock).not.toHaveBeenCalled()
    }
  )

  it("removeLine rejects a bad line id without calling Shopify", async () => {
    jar.set("cart", CART_ID)
    const fetchMock = stubCartApi()
    const { removeLine } = await loadActions()
    expect(await removeLine("nope")).toEqual({ ok: false, error: GENERIC_ERROR })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe("addToCart and the cart cookie", () => {
  it("creates a cart when there is no cookie, stores its id in an httpOnly cookie and returns only the contents", async () => {
    const fetchMock = stubCartApi()
    const { addToCart } = await loadActions()
    const result = await addToCart(VARIANT_ID, 2)

    expect(operations(fetchMock)).toEqual(["CartCreate"])
    expect(cookieSet).toHaveBeenCalledWith("cart", NEW_CART_ID, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // not production
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.cart?.checkoutUrl).toBe(CHECKOUT_URL)
    expect(JSON.stringify(result)).not.toContain(NEW_CART_ID)
  })

  it("marks the cookie Secure in production", async () => {
    vi.stubEnv("NODE_ENV", "production")
    stubCartApi()
    const { addToCart } = await loadActions()
    await addToCart(VARIANT_ID, 1)
    expect(cookieSet.mock.calls[0][2]).toMatchObject({ secure: true })
  })

  it("adds to the cart named by the cookie", async () => {
    jar.set("cart", CART_ID)
    const fetchMock = stubCartApi()
    const { addToCart } = await loadActions()
    await addToCart(VARIANT_ID, 1)

    expect(operations(fetchMock)).toEqual(["CartLinesAdd"])
    expect(sentRequests(fetchMock)[0].variables).toMatchObject({ cartId: CART_ID })
  })

  it("starts a fresh cart and replaces the cookie when the cookie's cart has expired", async () => {
    jar.set("cart", CART_ID)
    const fetchMock = stubCartApi({
      CartLinesAdd: () => ({ cartLinesAdd: { cart: null, userErrors: [{ code: "INVALID", field: ["cartId"] }] } }),
      Cart: () => ({ cart: null }),
    })
    const { addToCart } = await loadActions()
    const result = await addToCart(VARIANT_ID, 1)

    expect(operations(fetchMock)).toEqual(["CartLinesAdd", "Cart", "CartCreate"])
    expect(jar.get("cart")).toBe(NEW_CART_ID)
    expect(result.ok).toBe(true)
  })

  it("ignores a cookie that is not a Shopify cart id", async () => {
    jar.set("cart", "not-a-cart-id")
    const fetchMock = stubCartApi()
    const { addToCart } = await loadActions()
    await addToCart(VARIANT_ID, 1)
    expect(operations(fetchMock)).toEqual(["CartCreate"])
  })

  it("returns a user-safe error, with no Shopify detail, when Shopify fails", async () => {
    stubFetch(() => jsonResponse({ errors: [{ message: "Throttled: internal detail" }] }))
    const { addToCart } = await loadActions()
    const result = await addToCart(VARIANT_ID, 1)

    expect(result).toEqual({ ok: false, error: GENERIC_ERROR })
    expect(cookieSet).not.toHaveBeenCalled()
  })
})

describe("updateLine and removeLine", () => {
  it("updateLine sets the quantity", async () => {
    jar.set("cart", CART_ID)
    const fetchMock = stubCartApi()
    const { updateLine } = await loadActions()
    expect((await updateLine(LINE_ID, 3)).ok).toBe(true)
    expect(operations(fetchMock)).toEqual(["CartLinesUpdate"])
  })

  it("updateLine with quantity 0 removes the line", async () => {
    jar.set("cart", CART_ID)
    const fetchMock = stubCartApi()
    const { updateLine } = await loadActions()
    expect((await updateLine(LINE_ID, 0)).ok).toBe(true)
    expect(operations(fetchMock)).toEqual(["CartLinesRemove"])
    expect(sentRequests(fetchMock)[0].variables).toEqual({ cartId: CART_ID, lineIds: [LINE_ID] })
  })

  it("answer with an empty cart, without calling Shopify, when there is no cart cookie", async () => {
    const fetchMock = stubCartApi()
    const { updateLine, removeLine } = await loadActions()
    expect(await updateLine(LINE_ID, 2)).toEqual({ ok: true, cart: null })
    expect(await removeLine(LINE_ID)).toEqual({ ok: true, cart: null })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe("getCart", () => {
  it("is empty, without calling Shopify, when there is no cookie", async () => {
    const fetchMock = stubCartApi()
    const { getCart } = await loadActions()
    expect(await getCart()).toEqual({ ok: true, cart: null })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("returns the saved cart", async () => {
    jar.set("cart", CART_ID)
    stubCartApi()
    const { getCart } = await loadActions()
    const result = await getCart()
    expect(result.ok && result.cart?.totalQuantity).toBe(2)
  })

  it("is empty and clears the cookie when Shopify no longer has the cart", async () => {
    jar.set("cart", CART_ID)
    stubCartApi({ Cart: () => ({ cart: null }) })
    const { getCart } = await loadActions()
    expect(await getCart()).toEqual({ ok: true, cart: null })
    expect(cookieDelete).toHaveBeenCalledWith("cart")
  })
})

describe("addToCart with a requested color", () => {
  const attributesOf = (fetchMock: ReturnType<typeof stubCartApi>, index = 0) =>
    (sentRequests(fetchMock)[index].variables.lines as { attributes?: unknown }[])[0].attributes

  it("sends the trimmed color as the 'Requested color' line attribute", async () => {
    const fetchMock = stubCartApi()
    const { addToCart } = await loadActions()
    expect((await addToCart(VARIANT_ID, 1, "  Forest green ")).ok).toBe(true)
    expect(attributesOf(fetchMock)).toEqual([{ key: "Requested color", value: "Forest green" }])
  })

  it("sends no attribute when there is no color, or null", async () => {
    const fetchMock = stubCartApi()
    const { addToCart } = await loadActions()
    await addToCart(VARIANT_ID, 1)
    await addToCart(VARIANT_ID, 1, null)
    expect(attributesOf(fetchMock, 0)).toBeUndefined()
    expect(attributesOf(fetchMock, 1)).toBeUndefined()
  })

  it("keeps different typed colors on separate requests, each with its own attribute", async () => {
    const fetchMock = stubCartApi()
    const { addToCart } = await loadActions()
    await addToCart(VARIANT_ID, 1, "Forest green")
    await addToCart(VARIANT_ID, 1, "Sage")
    expect([0, 1].map((i) => attributesOf(fetchMock, i))).toEqual([
      [{ key: "Requested color", value: "Forest green" }],
      [{ key: "Requested color", value: "Sage" }],
    ])
  })

  it.each([["empty", ""], ["only spaces", "   "], ["too long", "x".repeat(41)], ["with a line break", "a\nb"], ["not a string", 7]])(
    "rejects a requested color that is %s without calling Shopify",
    async (_name, color) => {
      const fetchMock = stubCartApi()
      const { addToCart } = await loadActions()
      expect(await addToCart(VARIANT_ID, 1, color as string)).toEqual({ ok: false, error: GENERIC_ERROR })
      expect(fetchMock).not.toHaveBeenCalled()
    }
  )
})
