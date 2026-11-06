import { beforeEach, describe, expect, it, vi } from "vitest"
import { REVALIDATE_SECONDS } from "../cache"
import { STORE_DOMAIN, TOKEN, gqlData, jsonResponse, sentRequests, stubFetch, stubShopifyEnv } from "./helpers"

// The client is cached in module state, so load a fresh copy of the module for every test. The error
// classes come from the same fresh registry; the ones imported statically would be different classes.
async function loadClient() {
  vi.resetModules()
  const [client, errors] = await Promise.all([import("../client"), import("../errors")])
  return { ...client, ...errors }
}

const QUERY = "query Test { shop { name } }"
const ok = () => gqlData({ shop: { name: "x" } })

let errorLog: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  errorLog = vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("configuration", () => {
  it.each(["SHOPIFY_STORE_DOMAIN", "SHOPIFY_STOREFRONT_ACCESS_TOKEN"] as const)(
    "throws ShopifyConfigError naming %s when it is missing",
    async (name) => {
      stubShopifyEnv({ [name]: undefined })
      const fetchMock = stubFetch(ok)
      const { storefrontRequest, ShopifyConfigError } = await loadClient()

      const error = await storefrontRequest("op", QUERY, {}, []).catch((e: unknown) => e)
      expect(error).toBeInstanceOf(ShopifyConfigError)
      expect((error as Error).message).toContain(name)
      expect(fetchMock).not.toHaveBeenCalled()
    }
  )

  it.each([
    ["a protocol", "https://leaky-store.myshopify.com"],
    ["a path", "leaky-store.myshopify.com/admin"],
    ["a port", "leaky-store.myshopify.com:8080"],
  ])("rejects a store domain with %s without echoing it", async (_label, domain) => {
    stubShopifyEnv({ SHOPIFY_STORE_DOMAIN: domain })
    const fetchMock = stubFetch(ok)
    const { storefrontRequest, ShopifyConfigError } = await loadClient()

    const error = await storefrontRequest("op", QUERY, {}, []).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ShopifyConfigError)
    expect((error as Error).message).toContain("SHOPIFY_STORE_DOMAIN")
    expect((error as Error).message).not.toContain("leaky-store")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("sends requests to the configured store at the configured API version", async () => {
    stubShopifyEnv({ SHOPIFY_STOREFRONT_API_VERSION: "2099-01" })
    const fetchMock = stubFetch(ok)
    const { storefrontRequest } = await loadClient()
    await storefrontRequest("op", QUERY, {}, [])
    expect(sentRequests(fetchMock)[0].url).toBe(`https://${STORE_DOMAIN}/api/2099-01/graphql.json`)
  })

  it("falls back to a dated default API version when none is set", async () => {
    stubShopifyEnv()
    const fetchMock = stubFetch(ok)
    const { storefrontRequest } = await loadClient()
    await storefrontRequest("op", QUERY, {}, [])
    expect(sentRequests(fetchMock)[0].url).toMatch(
      new RegExp(`^https://${STORE_DOMAIN.replaceAll(".", "\\.")}/api/\\d{4}-\\d{2}/graphql\\.json$`)
    )
  })
})

describe("token type", () => {
  it.each([undefined, "private"])("uses the private token header when type is %s", async (type) => {
    stubShopifyEnv({ SHOPIFY_STOREFRONT_TOKEN_TYPE: type })
    const fetchMock = stubFetch(ok)
    const { storefrontRequest } = await loadClient()
    await storefrontRequest("op", QUERY, {}, [])

    const { headers } = sentRequests(fetchMock)[0]
    expect(headers.get("shopify-storefront-private-token")).toBe(TOKEN)
    expect(headers.has("x-shopify-storefront-access-token")).toBe(false)
  })

  it("uses the public token header when type is public", async () => {
    stubShopifyEnv({ SHOPIFY_STOREFRONT_TOKEN_TYPE: "public" })
    const fetchMock = stubFetch(ok)
    const { storefrontRequest } = await loadClient()
    await storefrontRequest("op", QUERY, {}, [])

    const { headers } = sentRequests(fetchMock)[0]
    expect(headers.get("x-shopify-storefront-access-token")).toBe(TOKEN)
    expect(headers.has("shopify-storefront-private-token")).toBe(false)
  })

  it.each(["Public", "secret-looking-value"])("rejects %s, naming the variable but not the value", async (value) => {
    stubShopifyEnv({ SHOPIFY_STOREFRONT_TOKEN_TYPE: value })
    const fetchMock = stubFetch(ok)
    const { storefrontRequest, ShopifyConfigError } = await loadClient()

    const error = await storefrontRequest("op", QUERY, {}, []).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ShopifyConfigError)
    expect((error as Error).message).toContain("SHOPIFY_STOREFRONT_TOKEN_TYPE")
    expect((error as Error).message).not.toContain(value)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe("fetch options", () => {
  it("strips the cache-tags header and passes revalidate and tags to fetch", async () => {
    stubShopifyEnv()
    const fetchMock = stubFetch(ok)
    const { storefrontRequest } = await loadClient()
    await storefrontRequest("op", QUERY, {}, ["shopify:products", "shopify:product:abc"])

    const request = sentRequests(fetchMock)[0]
    expect([...request.headers.keys()].some((name) => name.includes("cache-tags"))).toBe(false)
    expect(request.next).toEqual({
      revalidate: REVALIDATE_SECONDS,
      tags: ["shopify:products", "shopify:product:abc"],
    })
  })

  it("passes an empty tag list when no tags are given", async () => {
    stubShopifyEnv()
    const fetchMock = stubFetch(ok)
    const { storefrontRequest } = await loadClient()
    await storefrontRequest("op", QUERY, {}, [])
    expect(sentRequests(fetchMock)[0].next).toEqual({ revalidate: REVALIDATE_SECONDS, tags: [] })
  })

  it("sends the query and variables as JSON and returns data", async () => {
    stubShopifyEnv()
    const fetchMock = stubFetch(() => gqlData({ shop: { name: "Bee Shop" } }))
    const { storefrontRequest } = await loadClient()
    const data = await storefrontRequest<{ shop: { name: string } }>("op", QUERY, { a: 1 }, [])

    expect(data).toEqual({ shop: { name: "Bee Shop" } })
    expect(sentRequests(fetchMock)[0]).toMatchObject({ query: QUERY, variables: { a: 1 } })
  })
})

describe("failures", () => {
  const loggedText = () => JSON.stringify(errorLog.mock.calls)

  it("turns a GraphQL error response into ShopifyApiError and logs operation and status", async () => {
    stubShopifyEnv()
    stubFetch(() => jsonResponse({ errors: [{ message: "Throttled" }] }))
    const { storefrontRequest, ShopifyApiError } = await loadClient()

    const error = (await storefrontRequest("getThing", QUERY, {}, []).catch((e: unknown) => e)) as InstanceType<typeof ShopifyApiError>
    expect(error).toBeInstanceOf(ShopifyApiError)
    expect(error.operation).toBe("getThing")
    expect(error.message).toContain("Throttled")
    expect(error.cause).toBeDefined()

    expect(errorLog).toHaveBeenCalledTimes(1)
    expect(errorLog.mock.calls[0][0]).toBe("[shopify] getThing failed")
    expect(errorLog.mock.calls[0][1]).toHaveProperty("status")
    expect(loggedText()).not.toContain(TOKEN)
  })

  it("turns a network failure into ShopifyApiError and logs without secrets", async () => {
    stubShopifyEnv()
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")))
    const { storefrontRequest, ShopifyApiError } = await loadClient()

    const error = (await storefrontRequest("getThing", QUERY, {}, []).catch((e: unknown) => e)) as InstanceType<typeof ShopifyApiError>
    expect(error).toBeInstanceOf(ShopifyApiError)
    expect(error.operation).toBe("getThing")
    expect(error.status).toBeUndefined()

    expect(errorLog).toHaveBeenCalledTimes(1)
    expect(errorLog.mock.calls[0][0]).toBe("[shopify] getThing failed")
    expect(loggedText()).not.toContain(TOKEN)
    expect(loggedText().toLowerCase()).not.toContain("private-token")
  })

  it("carries the HTTP status on ShopifyApiError", async () => {
    stubShopifyEnv()
    stubFetch(() => new Response("nope", { status: 401, statusText: "Unauthorized" }))
    const { storefrontRequest, ShopifyApiError } = await loadClient()

    const error = (await storefrontRequest("getThing", QUERY, {}, []).catch((e: unknown) => e)) as InstanceType<typeof ShopifyApiError>
    expect(error).toBeInstanceOf(ShopifyApiError)
    expect(error.status).toBe(401)
    expect(errorLog.mock.calls[0][1]).toMatchObject({ status: 401 })
    expect(loggedText()).not.toContain(TOKEN)
  })

  it("treats a response with neither data nor errors as ShopifyApiError", async () => {
    stubShopifyEnv()
    stubFetch(() => jsonResponse({}))
    const { storefrontRequest, ShopifyApiError } = await loadClient()
    await expect(storefrontRequest("getThing", QUERY, {}, [])).rejects.toBeInstanceOf(ShopifyApiError)
  })
})
