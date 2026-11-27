import { inspect } from "node:util"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TOKEN, jsonResponse, sentRequests, stubFetch, stubShopifyEnv } from "./helpers"

// Guard for #22: a failed Storefront request is logged as "[shopify] <operation> failed" with its
// status, and neither that log line nor the thrown error (which Next logs for a failed page)
// carries the token, the token or buyer-IP header names, or the buyer's IP.

const headersMock = vi.hoisted(() => vi.fn())
vi.mock("next/headers", () => ({ headers: headersMock, cookies: vi.fn() }))

const BUYER_IP = "203.0.113.7"
const FORBIDDEN = [
  TOKEN,
  "shopify-storefront-private-token",
  "x-shopify-storefront-access-token",
  "shopify-storefront-buyer-ip",
  BUYER_IP,
]

async function loadClient() {
  vi.resetModules()
  return import("../client")
}

const QUERY = "query Test { shop { name } }"

const failures = [
  { kind: "an HTTP error status", status: 500, respond: () => new Response("boom", { status: 500 }) },
  { kind: "GraphQL errors", status: 200, respond: () => jsonResponse({ errors: [{ message: "Throttled" }] }) },
  {
    kind: "a network failure",
    status: undefined,
    respond: (): Response => {
      throw new TypeError("fetch failed")
    },
  },
]

let errorLog: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  errorLog = vi.spyOn(console, "error").mockImplementation(() => {})
  headersMock.mockResolvedValue(new Headers({ "x-forwarded-for": `${BUYER_IP}, 10.0.0.1` }))
})

describe.each(["private", "public"] as const)("failure logging with a %s token", (tokenType) => {
  describe.each([
    { path: "catalog", run: (c: Awaited<ReturnType<typeof loadClient>>) => c.storefrontRequest("getThing", QUERY, {}, ["shopify:products"]) },
    { path: "cart", run: (c: Awaited<ReturnType<typeof loadClient>>) => c.cartRequest("getThing", QUERY, {}) },
  ])("$path request", ({ path, run }) => {
    it.each(failures)("on $kind logs operation and status only", async ({ status, respond }) => {
      stubShopifyEnv({ SHOPIFY_STOREFRONT_TOKEN_TYPE: tokenType })
      const fetchMock = stubFetch(respond)
      const client = await loadClient()
      const error = await run(client).catch((e: unknown) => e)

      // The secrets really were in the request, so the checks below are not vacuous.
      const sent = sentRequests(fetchMock)[0].headers
      expect([...sent.values()]).toContain(TOKEN)
      if (path === "cart" && tokenType === "private") expect(sent.get("shopify-storefront-buyer-ip")).toBe(BUYER_IP)

      expect(errorLog).toHaveBeenCalledTimes(1)
      expect(errorLog.mock.calls[0][0]).toBe("[shopify] getThing failed")
      expect(errorLog.mock.calls[0][1]).toEqual(expect.objectContaining({ status }))

      const logged = (JSON.stringify(errorLog.mock.calls) + inspect(error, { depth: 10 })).toLowerCase()
      for (const secret of FORBIDDEN) expect(logged).not.toContain(secret.toLowerCase())
    })
  })
})
