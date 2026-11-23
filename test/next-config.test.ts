import { describe, expect, it } from "vitest"
import nextConfig from "../next.config"

describe("next.config images", () => {
  // Without this, /_next/image answers 400 INVALID_IMAGE_OPTIMIZE_REQUEST for every Shopify photo
  // (shop cards, product gallery, cart thumbnails).
  it("allows Shopify's CDN product images, and nothing broader", () => {
    expect(nextConfig.images?.remotePatterns).toEqual([
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/s/files/**" },
    ])
  })

  it("has no deprecated catch-all image domains", () => {
    expect(nextConfig.images?.domains).toBeUndefined()
  })
})
