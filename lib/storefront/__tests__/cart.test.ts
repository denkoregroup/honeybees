import { beforeEach, describe, expect, it, vi } from "vitest"
import { CACHE_TAGS, REVALIDATE_SECONDS } from "../cache"
import {
  CART_ID,
  CHECKOUT_URL,
  LINE_ID,
  NEW_CART_ID,
  TOKEN,
  VARIANT_ID,
  cartOperation,
  gqlData,
  rawCart,
  sentRequests,
  stubFetch,
  stubShopifyEnv,
  type SentRequest,
} from "./helpers"

const headersMock = vi.hoisted(() => vi.fn())
vi.mock("next/headers", () => ({ headers: headersMock, cookies: vi.fn() }))

// The client is cached in module state, and error classes must come from the same registry as the code under test.
async function load() {
  vi.resetModules()
  const [cart, products, errors] = await Promise.all([import("../cart"), import("../products"), import("../errors")])
  return { ...cart, ...products, ...errors }
}

const emptyProducts = { products: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } }

/** Answers each cart operation with a live cart unless `overrides` says otherwise. */
function stubCartApi(overrides: Record<string, (req: SentRequest) => unknown> = {}) {
  return stubFetch((req) => {
    const operation = cartOperation(req.query) ?? ""
    if (overrides[operation]) return gqlData(overrides[operation](req))
    switch (operation) {
      case "Cart":
        return gqlData({ cart: rawCart() })
      case "CartCreate":
        return gqlData({ cartCreate: { cart: rawCart(NEW_CART_ID, 1), userErrors: [] } })
      case "CartLinesAdd":
        return gqlData({ cartLinesAdd: { cart: rawCart(), userErrors: [] } })
      case "CartLinesUpdate":
        return gqlData({ cartLinesUpdate: { cart: rawCart(), userErrors: [] } })
      case "CartLinesRemove":
        return gqlData({ cartLinesRemove: { cart: rawCart(), userErrors: [] } })
      default:
        return gqlData(emptyProducts)
    }
  })
}

const operations = (fetchMock: ReturnType<typeof stubFetch>) =>
  sentRequests(fetchMock).map((r) => cartOperation(r.query))

let errorLog: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  errorLog = vi.spyOn(console, "error").mockImplementation(() => {})
  headersMock.mockResolvedValue(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))
})

describe("caching", () => {
  it("never caches cart requests, while catalog requests keep the 5-minute cache and tags", async () => {
    stubShopifyEnv()
    const fetchMock = stubCartApi()
    const { getCart, addLine, updateLine, removeLine, getProducts } = await load()

    await getCart(CART_ID)
    await addLine(undefined, VARIANT_ID, 1) // cartCreate
    await addLine(CART_ID, VARIANT_ID, 1) // cartLinesAdd
    await updateLine(CART_ID, LINE_ID, 3)
    await removeLine(CART_ID, LINE_ID)
    await getProducts()

    const requests = sentRequests(fetchMock)
    const cartRequests = requests.slice(0, -1)
    const catalogRequest = requests.at(-1)!

    expect(operations(fetchMock)).toEqual(["Cart", "CartCreate", "CartLinesAdd", "CartLinesUpdate", "CartLinesRemove", "Products"])
    for (const request of cartRequests) {
      expect(request.cache).toBe("no-store")
      expect(request.next).toBeUndefined() // no revalidate, no tags
    }
    expect(catalogRequest.next).toEqual({ revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.products] })
    expect(catalogRequest.cache).toBeUndefined()
  })
})

describe("buyer IP header", () => {
  it("is sent on cart requests with a private token, using the first forwarded address", async () => {
    stubShopifyEnv({ SHOPIFY_STOREFRONT_TOKEN_TYPE: "private" })
    const fetchMock = stubCartApi()
    const { getCart } = await load()
    await getCart(CART_ID)
    expect(sentRequests(fetchMock)[0].headers.get("shopify-storefront-buyer-ip")).toBe("203.0.113.7")
  })

  it("is not sent with a public token, and the request headers are not even read", async () => {
    stubShopifyEnv({ SHOPIFY_STOREFRONT_TOKEN_TYPE: "public" })
    const fetchMock = stubCartApi()
    const { getCart } = await load()
    await getCart(CART_ID)
    expect(sentRequests(fetchMock)[0].headers.has("shopify-storefront-buyer-ip")).toBe(false)
    expect(headersMock).not.toHaveBeenCalled()
  })

  it("is left out when the incoming request carries no forwarded address", async () => {
    stubShopifyEnv({ SHOPIFY_STOREFRONT_TOKEN_TYPE: "private" })
    headersMock.mockResolvedValue(new Headers())
    const fetchMock = stubCartApi()
    const { getCart } = await load()
    await getCart(CART_ID)
    expect(sentRequests(fetchMock)[0].headers.has("shopify-storefront-buyer-ip")).toBe(false)
  })

  it("is never sent on catalog reads, even with a private token", async () => {
    stubShopifyEnv({ SHOPIFY_STOREFRONT_TOKEN_TYPE: "private" })
    const fetchMock = stubCartApi()
    const { getProducts } = await load()
    await getProducts()
    expect(sentRequests(fetchMock)[0].headers.has("shopify-storefront-buyer-ip")).toBe(false)
    expect(headersMock).not.toHaveBeenCalled()
  })
})

describe("getCart", () => {
  it("returns the cart in the shape the browser needs, plus the id for the server", async () => {
    stubShopifyEnv()
    stubCartApi()
    const { getCart } = await load()
    const stored = await getCart(CART_ID)

    expect(stored?.cartId).toBe(CART_ID)
    expect(stored?.cart).toEqual({
      checkoutUrl: CHECKOUT_URL,
      totalQuantity: 2,
      subtotal: { amount: "50.00", currencyCode: "USD" },
      total: { amount: "50.00", currencyCode: "USD" },
      lines: [
        {
          id: LINE_ID,
          title: "Bee Kind Tumbler",
          variantTitle: "20oz",
          image: { url: "https://cdn.example.com/tumbler.png", altText: null, width: 800, height: 600 },
          quantity: 2,
          unitPrice: { amount: "25.00", currencyCode: "USD" },
          totalPrice: { amount: "50.00", currencyCode: "USD" },
        },
      ],
    })
    expect(JSON.stringify(stored?.cart)).not.toContain(CART_ID) // the id is for the server only
  })

  it("is null when Shopify no longer has the cart", async () => {
    stubShopifyEnv()
    stubCartApi({ Cart: () => ({ cart: null }) })
    const { getCart } = await load()
    expect(await getCart(CART_ID)).toBeNull()
  })
})

describe("addLine", () => {
  it("creates a cart with the line when there is no cart id", async () => {
    stubShopifyEnv()
    const fetchMock = stubCartApi()
    const { addLine } = await load()
    const stored = await addLine(undefined, VARIANT_ID, 2)

    expect(operations(fetchMock)).toEqual(["CartCreate"])
    expect(sentRequests(fetchMock)[0].variables).toEqual({ lines: [{ merchandiseId: VARIANT_ID, quantity: 2 }] })
    expect(stored.cartId).toBe(NEW_CART_ID)
  })

  it("adds to the existing cart with a single request", async () => {
    stubShopifyEnv()
    const fetchMock = stubCartApi()
    const { addLine } = await load()
    const stored = await addLine(CART_ID, VARIANT_ID, 1)

    expect(operations(fetchMock)).toEqual(["CartLinesAdd"])
    expect(sentRequests(fetchMock)[0].variables).toEqual({
      cartId: CART_ID,
      lines: [{ merchandiseId: VARIANT_ID, quantity: 1 }],
    })
    expect(stored.cartId).toBe(CART_ID)
  })

  it("starts a fresh cart with the line when Shopify says the cart is gone or expired", async () => {
    stubShopifyEnv()
    const fetchMock = stubCartApi({
      CartLinesAdd: () => ({ cartLinesAdd: { cart: null, userErrors: [{ code: "INVALID", field: ["cartId"] }] } }),
      Cart: () => ({ cart: null }),
    })
    const { addLine } = await load()
    const stored = await addLine(CART_ID, VARIANT_ID, 3)

    expect(operations(fetchMock)).toEqual(["CartLinesAdd", "Cart", "CartCreate"])
    expect(sentRequests(fetchMock)[2].variables).toEqual({ lines: [{ merchandiseId: VARIANT_ID, quantity: 3 }] })
    expect(stored.cartId).toBe(NEW_CART_ID)
  })

  it("throws, and does not start a new cart, when the add fails but the cart still exists", async () => {
    stubShopifyEnv()
    const fetchMock = stubCartApi({
      CartLinesAdd: () => ({ cartLinesAdd: { cart: null, userErrors: [{ code: "MAXIMUM_EXCEEDED", field: ["lines"] }] } }),
    })
    const { addLine, ShopifyApiError } = await load()

    await expect(addLine(CART_ID, VARIANT_ID, 1)).rejects.toBeInstanceOf(ShopifyApiError)
    expect(operations(fetchMock)).toEqual(["CartLinesAdd", "Cart"])
  })
})

describe("updateLine and removeLine", () => {
  it("send the line id and quantity", async () => {
    stubShopifyEnv()
    const fetchMock = stubCartApi()
    const { updateLine, removeLine } = await load()
    await updateLine(CART_ID, LINE_ID, 4)
    await removeLine(CART_ID, LINE_ID)

    const [update, remove] = sentRequests(fetchMock)
    expect(update.variables).toEqual({ cartId: CART_ID, lines: [{ id: LINE_ID, quantity: 4 }] })
    expect(remove.variables).toEqual({ cartId: CART_ID, lineIds: [LINE_ID] })
  })

  it("throw ShopifyApiError when Shopify returns user errors", async () => {
    stubShopifyEnv()
    stubCartApi({
      CartLinesUpdate: () => ({ cartLinesUpdate: { cart: null, userErrors: [{ code: "INVALID_MERCHANDISE_LINE", field: ["lines"] }] } }),
    })
    const { updateLine, ShopifyApiError } = await load()
    await expect(updateLine(CART_ID, LINE_ID, 2)).rejects.toBeInstanceOf(ShopifyApiError)
  })
})

describe("logging", () => {
  it("logs the operation and error codes only, never cart ids, checkout URLs or tokens", async () => {
    stubShopifyEnv()
    stubCartApi({
      CartLinesAdd: () => ({ cartLinesAdd: { cart: null, userErrors: [{ code: "MAXIMUM_EXCEEDED", field: ["lines"] }] } }),
    })
    const { addLine } = await load()
    await addLine(CART_ID, VARIANT_ID, 1).catch(() => {})

    const logged = JSON.stringify(errorLog.mock.calls)
    expect(logged).toContain("cartLinesAdd")
    expect(logged).toContain("MAXIMUM_EXCEEDED")
    for (const secret of [CART_ID, "secret-cart-key", CHECKOUT_URL, TOKEN, VARIANT_ID]) {
      expect(logged).not.toContain(secret)
    }
  })
})
