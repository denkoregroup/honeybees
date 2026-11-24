import { existsSync } from "node:fs"
import { join } from "node:path"
import type { Metadata } from "next"
import { describe, expect, it, vi } from "vitest"

// Pages import the catalog layer and the layout imports Google fonts; neither is needed for metadata.
vi.mock("@/lib/storefront", () => ({}))
vi.mock("next/font/google", () => {
  const font = () => ({ variable: "font" })
  return { Inter: font, Montserrat: font, Pacifico: font }
})

const STATIC_PAGES = {
  "/about": () => import("../about/page"),
  "/collections": () => import("../collections/page"),
  "/contact": () => import("../contact/page"),
  "/faq": () => import("../faq/page"),
  "/shop": () => import("../shop/page"),
}

async function layoutMetadata(): Promise<Metadata> {
  vi.resetModules()
  return (await import("../layout")).metadata
}

describe("home page metadata", () => {
  it("uses the hero tagline as the full title, without the layout's suffix", async () => {
    const { metadata } = await import("../page")
    expect(metadata.title).toEqual({ absolute: "HoneyBee Designs | Cute. Custom. Made to Make You Smile!" })
  })

  it("sets nothing else, so it inherits the site description and share image", async () => {
    const { metadata } = await import("../page")
    expect(Object.keys(metadata)).toEqual(["title"])
  })
})

describe("static page titles", () => {
  it.each(Object.entries(STATIC_PAGES))("%s has a short title (the layout adds the brand once)", async (_, load) => {
    const { metadata } = (await load()) as { metadata: Metadata }
    expect(typeof metadata.title).toBe("string")
    expect(metadata.title).not.toMatch(/HoneyBee Designs/)
    expect(metadata.description).toBeTruthy()
  })
})

describe("root layout metadata", () => {
  it("adds the brand to page titles and falls back to just the brand", async () => {
    expect((await layoutMetadata()).title).toEqual({ default: "HoneyBee Designs", template: "%s | HoneyBee Designs" })
  })

  it("resolves relative URLs against the default site URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined)
    expect(String((await layoutMetadata()).metadataBase)).toBe("https://honeybeedesigns.shop/")
  })

  it("resolves relative URLs against NEXT_PUBLIC_SITE_URL when it is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.test")
    expect(String((await layoutMetadata()).metadataBase)).toBe("https://example.test/")
  })

  it("shares the logo by default and sets no og:url (pages would all inherit the home URL)", async () => {
    const { openGraph } = await layoutMetadata()
    expect(openGraph).toMatchObject({
      siteName: "HoneyBee Designs",
      images: [{ url: "/images/logo.png", width: 1536, height: 709, alt: "HoneyBee Designs" }],
    })
    expect(openGraph).not.toHaveProperty("url")
    expect(existsSync(join(__dirname, "..", "..", "public", "images", "logo.png"))).toBe(true)
  })
})
