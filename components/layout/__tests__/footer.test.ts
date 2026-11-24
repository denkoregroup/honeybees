import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { STORE_DOMAIN, gqlData, jsonResponse, stubFetch, stubShopifyEnv } from "@/lib/storefront/__tests__/helpers"

const PRIVACY_URL = `https://${STORE_DOMAIN}/policies/privacy-policy`
const NO_POLICIES = { privacyPolicy: null, termsOfService: null, refundPolicy: null, shippingPolicy: null }

async function renderFooter() {
  vi.resetModules()
  const { Footer } = await import("../Footer")
  return renderToStaticMarkup(await Footer())
}

const hrefs = (html: string) => [...html.matchAll(/<a\b[^>]*>/g)].map(([tag]) => /\bhref="([^"]*)"/.exec(tag)?.[1] ?? "")

beforeEach(() => {
  stubShopifyEnv()
  vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("Footer", () => {
  it("has no dead links: every link has a real href (not empty or #)", async () => {
    stubFetch(() => gqlData({ shop: { ...NO_POLICIES, privacyPolicy: { title: "Privacy policy", url: PRIVACY_URL } } }))
    const links = hrefs(await renderFooter())
    expect(links.length).toBeGreaterThan(0)
    expect(links.filter((href) => href.trim() === "" || href.startsWith("#"))).toEqual([])
  })

  it("links each existing policy to its Shopify URL, on mobile and desktop", async () => {
    stubFetch(() => gqlData({ shop: { ...NO_POLICIES, privacyPolicy: { title: "Privacy policy", url: PRIVACY_URL } } }))
    const html = await renderFooter()
    expect(hrefs(html).filter((href) => href === PRIVACY_URL)).toHaveLength(2)
    expect(html).toContain(">Privacy policy</a>")
  })

  it("has no Reviews link, and keeps Our Story and Custom Orders", async () => {
    stubFetch(() => gqlData({ shop: NO_POLICIES }))
    const html = await renderFooter()
    expect(html).not.toMatch(/>Reviews</)
    for (const label of ["Our Story", "Custom Orders"]) expect(html).toContain(label)
  })

  it("shows no policy link that Shopify doesn't have", async () => {
    stubFetch(() => gqlData({ shop: NO_POLICIES }))
    const html = await renderFooter()
    expect(html).not.toMatch(/policy|terms of service/i)
  })

  it("still renders, without policy links, when the policy fetch fails", async () => {
    stubFetch(() => jsonResponse({ errors: "boom" }, 500))
    const html = await renderFooter()
    expect(html).toContain("All Products")
    expect(html).toContain("All rights reserved.")
    expect(html).not.toMatch(/policy/i)
    expect(hrefs(html).filter((href) => href.trim() === "" || href.startsWith("#"))).toEqual([])
  })

  it("drops links to pages that don't exist yet", async () => {
    stubFetch(() => gqlData({ shop: NO_POLICIES }))
    const html = await renderFooter()
    for (const label of ["FAQ", "Order Tracking", "Care Instructions", "Size Charts", "Wholesale", "Reviews", "Shipping &amp; Returns"]) {
      expect(html).not.toContain(label)
    }
  })
})
