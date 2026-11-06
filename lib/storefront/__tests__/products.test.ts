import { beforeEach, describe, expect, it, vi } from "vitest"
import { CACHE_TAGS } from "../cache"
import { EXTRA_VARIANTS_PAGE_SIZE, MAX_EXTRA_VARIANT_PAGES } from "../products"
import { VARIANTS_PAGE_SIZE } from "../queries"
import {
  type SentRequest,
  gqlData,
  rawProduct,
  rawSummary,
  rawVariant,
  sentRequests,
  stubFetch,
  stubShopifyEnv,
} from "./helpers"

// Fresh module registry per test; the error class must come from the same registry as the code under test.
async function loadProducts() {
  vi.resetModules()
  const [products, errors] = await Promise.all([import("../products"), import("../errors")])
  return { ...products, ...errors }
}

let errorLog: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  stubShopifyEnv()
  errorLog = vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("getProducts", () => {
  it("returns summaries with page info", async () => {
    const fetchMock = stubFetch(() =>
      gqlData({
        products: {
          nodes: [rawSummary(), rawSummary({ id: "gid://shopify/Product/2", handle: "second" })],
          pageInfo: { hasNextPage: true, endCursor: "cursor-2" },
        },
      })
    )
    const { getProducts } = await loadProducts()
    const page = await getProducts({ first: 2 })

    expect(page.items.map((p) => p.handle)).toEqual(["bee-kind-tumbler", "second"])
    expect(page.pageInfo).toEqual({ hasNextPage: true, endCursor: "cursor-2" })
    expect(Object.keys(page.items[0])).not.toContain("variants")

    const [request] = sentRequests(fetchMock)
    expect(request.variables).toEqual({ first: 2, after: null })
    expect(request.next?.tags).toEqual([CACHE_TAGS.products])
  })

  it("passes the cursor and a default page size", async () => {
    const fetchMock = stubFetch(() =>
      gqlData({ products: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } })
    )
    const { getProducts } = await loadProducts()
    const page = await getProducts({ after: "cursor-1" })

    expect(sentRequests(fetchMock)[0].variables).toEqual({ first: 24, after: "cursor-1" })
    expect(page).toEqual({ items: [], pageInfo: { hasNextPage: false, endCursor: null } })
  })

  it("rejects an invalid page size before making a request", async () => {
    const fetchMock = stubFetch(() => gqlData({}))
    const { getProducts } = await loadProducts()
    await expect(getProducts({ first: 0 })).rejects.toBeInstanceOf(RangeError)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe("getProductByHandle", () => {
  it("returns null for an unknown handle", async () => {
    const fetchMock = stubFetch(() => gqlData({ product: null }))
    const { getProductByHandle } = await loadProducts()
    expect(await getProductByHandle("nope")).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it.each(["", "   "])("returns null for the empty handle %j without making a request", async (handle) => {
    const fetchMock = stubFetch(() => gqlData({ product: null }))
    const { getProductByHandle } = await loadProducts()
    expect(await getProductByHandle(handle)).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("returns the full product and tags the request with the product handle", async () => {
    const fetchMock = stubFetch(() => gqlData({ product: rawProduct() }))
    const { getProductByHandle } = await loadProducts()
    const product = await getProductByHandle("bee-kind-tumbler")

    expect(product?.title).toBe("Bee Kind Tumbler")
    expect(product?.variants).toHaveLength(1)
    expect(product?.options).toEqual([{ name: "Size", values: ["20oz", "30oz"] }])
    expect(sentRequests(fetchMock)[0].variables).toEqual({ handle: "bee-kind-tumbler" })
    expect(sentRequests(fetchMock)[0].next?.tags).toEqual([
      CACHE_TAGS.products,
      CACHE_TAGS.product("bee-kind-tumbler"),
    ])
  })
})

describe("variant paging", () => {
  const FIRST_PAGE = VARIANTS_PAGE_SIZE
  const EXTRA_PAGE = EXTRA_VARIANTS_PAGE_SIZE
  const MAX_PAGES = MAX_EXTRA_VARIANT_PAGES
  /** Most variants getProductByHandle can return: the first page plus every allowed follow-up page. */
  const CAPACITY = FIRST_PAGE + MAX_PAGES * EXTRA_PAGE

  /** Fakes a store whose product has `total` variants, served in pages like the real API. */
  function stubProductWithVariants(total: number) {
    return stubFetch((req: SentRequest) => {
      const isDetailQuery = req.query.includes("query ProductByHandle")
      const start = isDetailQuery ? 0 : Number(String(req.variables.after).replace("cursor-", ""))
      const size = isDetailQuery ? FIRST_PAGE : Number(req.variables.first)
      const end = Math.min(start + size, total)
      const nodes = Array.from({ length: end - start }, (_, i) => rawVariant(start + i))
      const variants = { nodes, pageInfo: { hasNextPage: end < total, endCursor: `cursor-${end}` } }
      return gqlData({
        product: isDetailQuery ? { ...rawProduct({}, []), variants } : { variants },
      })
    })
  }

  it.each([
    [Math.floor(FIRST_PAGE / 2), 0],
    [FIRST_PAGE, 0],
    [FIRST_PAGE + 1, 1],
    [FIRST_PAGE + 2 * EXTRA_PAGE, 2],
    [CAPACITY, MAX_PAGES],
  ])("a product with %i variants makes %i extra requests and returns them all", async (total, extra) => {
    const fetchMock = stubProductWithVariants(total)
    const { getProductByHandle } = await loadProducts()
    const product = await getProductByHandle("big")

    expect(fetchMock).toHaveBeenCalledTimes(1 + extra)
    expect(product?.variants).toHaveLength(total)
    expect(new Set(product?.variants.map((v) => v.id)).size).toBe(total)
    expect(errorLog).not.toHaveBeenCalled()
  })

  it("requests follow-up pages of the follow-up page size using the previous cursor", async () => {
    const fetchMock = stubProductWithVariants(FIRST_PAGE + 2 * EXTRA_PAGE)
    const { getProductByHandle } = await loadProducts()
    await getProductByHandle("big")

    const [, second, third] = sentRequests(fetchMock)
    expect(second.variables).toEqual({ handle: "big", first: EXTRA_PAGE, after: `cursor-${FIRST_PAGE}` })
    expect(third.variables).toEqual({
      handle: "big",
      first: EXTRA_PAGE,
      after: `cursor-${FIRST_PAGE + EXTRA_PAGE}`,
    })
    expect(second.next?.tags).toEqual([CACHE_TAGS.products, CACHE_TAGS.product("big")])
  })

  it("returns the capped variants and logs the error exactly once when the product is over the cap", async () => {
    const fetchMock = stubProductWithVariants(CAPACITY + EXTRA_PAGE)
    const { getProductByHandle } = await loadProducts()
    const product = await getProductByHandle("huge")

    expect(fetchMock).toHaveBeenCalledTimes(1 + MAX_PAGES)
    expect(product?.variants).toHaveLength(CAPACITY)
    expect(errorLog).toHaveBeenCalledTimes(1)
    expect(String(errorLog.mock.calls[0][0])).toContain("variant page cap reached")
    expect(String(errorLog.mock.calls[0][0])).toContain("huge")
  })

  it("stops and returns what it has if a follow-up page says the product is gone", async () => {
    const fetchMock = stubFetch((req) =>
      req.query.includes("query ProductByHandle")
        ? gqlData({
            product: {
              ...rawProduct({}, []),
              variants: {
                nodes: Array.from({ length: FIRST_PAGE }, (_, i) => rawVariant(i)),
                pageInfo: { hasNextPage: true, endCursor: `cursor-${FIRST_PAGE}` },
              },
            },
          })
        : gqlData({ product: null })
    )
    const { getProductByHandle } = await loadProducts()
    const product = await getProductByHandle("gone")

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(product?.variants).toHaveLength(FIRST_PAGE)
  })

  it("propagates an API failure on a follow-up page as ShopifyApiError", async () => {
    stubFetch((req) =>
      req.query.includes("query ProductByHandle")
        ? gqlData({
            product: {
              ...rawProduct({}, []),
              variants: { nodes: [rawVariant(0)], pageInfo: { hasNextPage: true, endCursor: "cursor-1" } },
            },
          })
        : new Response("{}", { status: 500, statusText: "Server Error" })
    )
    const { getProductByHandle, ShopifyApiError } = await loadProducts()
    await expect(getProductByHandle("flaky")).rejects.toBeInstanceOf(ShopifyApiError)
  })
})
