import { describe, expect, it, vi } from "vitest"

async function robots() {
  vi.resetModules()
  const { default: build } = await import("../robots")
  return build()
}

describe("robots", () => {
  it("allows the site, keeps crawlers out of the cart and API routes, and points at the sitemap", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined)
    expect(await robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: ["/cart", "/api/"] },
      sitemap: "https://honeybeedesigns.shop/sitemap.xml",
    })
  })

  it("uses NEXT_PUBLIC_SITE_URL for the sitemap link", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.test")
    expect((await robots()).sitemap).toBe("https://example.test/sitemap.xml")
  })
})
