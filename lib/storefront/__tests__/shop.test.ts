import { beforeEach, describe, expect, it, vi } from "vitest"
import { CACHE_TAGS, REVALIDATE_SECONDS } from "../cache"
import { STORE_DOMAIN, gqlData, jsonResponse, sentRequests, stubFetch, stubShopifyEnv } from "./helpers"

async function loadShop() {
  vi.resetModules()
  const [shop, errors] = await Promise.all([import("../shop"), import("../errors")])
  return { ...shop, ...errors }
}

beforeEach(() => {
  stubShopifyEnv()
  vi.spyOn(console, "error").mockImplementation(() => {})
})

const policy = (title: string, handle: string) => ({ title, url: `https://${STORE_DOMAIN}/policies/${handle}` })

describe("getShopPolicies", () => {
  it("returns only the policies Shopify has, with the URLs Shopify gives", async () => {
    stubFetch(() =>
      gqlData({
        shop: {
          privacyPolicy: policy("Privacy policy", "privacy-policy"),
          termsOfService: null,
          refundPolicy: null,
          shippingPolicy: null,
        },
      })
    )
    const { getShopPolicies } = await loadShop()
    expect(await getShopPolicies()).toEqual([policy("Privacy policy", "privacy-policy")])
  })

  it("returns every policy in privacy, terms, refund, shipping order when all exist", async () => {
    stubFetch(() =>
      gqlData({
        shop: {
          shippingPolicy: policy("Shipping policy", "shipping-policy"),
          refundPolicy: policy("Refund policy", "refund-policy"),
          termsOfService: policy("Terms of service", "terms-of-service"),
          privacyPolicy: policy("Privacy policy", "privacy-policy"),
        },
      })
    )
    const { getShopPolicies } = await loadShop()
    expect((await getShopPolicies()).map((p) => p.title)).toEqual([
      "Privacy policy",
      "Terms of service",
      "Refund policy",
      "Shipping policy",
    ])
  })

  it("returns an empty list when no policy exists", async () => {
    stubFetch(() =>
      gqlData({ shop: { privacyPolicy: null, termsOfService: null, refundPolicy: null, shippingPolicy: null } })
    )
    const { getShopPolicies } = await loadShop()
    expect(await getShopPolicies()).toEqual([])
  })

  it("asks for the four policies' title and url, cached and tagged like other catalog reads", async () => {
    const fetchMock = stubFetch(() =>
      gqlData({ shop: { privacyPolicy: null, termsOfService: null, refundPolicy: null, shippingPolicy: null } })
    )
    const { getShopPolicies } = await loadShop()
    await getShopPolicies()

    const [request] = sentRequests(fetchMock)
    for (const field of ["privacyPolicy", "termsOfService", "refundPolicy", "shippingPolicy"]) {
      expect(request.query).toMatch(new RegExp(`${field} \\{ title url \\}`))
    }
    expect(request.next).toEqual({ revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.policies] })
  })

  it("throws ShopifyApiError when the request fails", async () => {
    stubFetch(() => jsonResponse({ errors: "boom" }, 500))
    const { getShopPolicies, ShopifyApiError } = await loadShop()
    await expect(getShopPolicies()).rejects.toBeInstanceOf(ShopifyApiError)
  })
})
