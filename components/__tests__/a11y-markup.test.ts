import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { ProductSummary } from "@/lib/storefront/types"
import { ContactForm } from "../features/ContactForm"
import { ProductCard } from "../features/ProductCard"
import { ShopFilters } from "../features/ShopFilters"
import { EmailSignup } from "../home/EmailSignup"
import { FeaturedProducts } from "../home/FeaturedProducts"
import { Header } from "../layout/Header"

vi.mock("next/navigation", () => ({ usePathname: () => "/shop" }))

const usd = (amount: string) => ({ amount, currencyCode: "USD" })
const product = (overrides: Partial<ProductSummary> = {}): ProductSummary => ({
  id: "gid://shopify/Product/1",
  title: "Shell Yeah",
  handle: "shell-yeah",
  tags: [],
  availableForSale: true,
  featuredImage: { url: "https://cdn.shopify.com/s/files/1/shell-yeah.png", altText: null, width: 800, height: 800 },
  priceRange: { min: usd("20.0"), max: usd("20.0") },
  compareAtPriceRange: null,
  collections: [{ id: "gid://shopify/Collection/1", title: "Turtley Apparel", handle: "apparel-1" }],
  ...overrides,
})

const tags = (html: string, name: string) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map(([tag]) => tag)
// HTML attribute names are case-insensitive (React writes autoComplete, maxLength...)
const attr = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`, "i").exec(tag)?.[1]
const text = (html: string) => html.replace(/<[^>]*aria-hidden="true"[^>]*>[^<]*<\/[^>]+>/g, "").replace(/<[^>]+>/g, "").trim()

/** Every <button> has a name: an aria-label, or text that isn't hidden from screen readers. */
function unnamedButtons(html: string): string[] {
  return [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)]
    .filter(([, attrs, inner]) => !attr(attrs, "aria-label") && text(inner) === "")
    .map(([tag]) => tag.slice(0, 120))
}

describe("product images in cards are decorative", () => {
  it("ProductCard: the photo has empty alt, since the product name is in the same link", () => {
    const html = renderToStaticMarkup(createElement(ProductCard, { product: product() }))
    const [img] = tags(html, "img")
    expect(attr(img, "alt")).toBe("")
    expect(html).toContain("Shell Yeah")
  })

  it("ProductCard: a sale price says what the struck-through price is", () => {
    const html = renderToStaticMarkup(
      createElement(ProductCard, {
        product: product({ compareAtPriceRange: { min: usd("25.0"), max: usd("25.0") } }),
      }),
    )
    expect(html).toMatch(/<span class="sr-only">Was <\/span>\$25\.00/)
  })

  it("FeaturedProducts: every photo has empty alt, on mobile and desktop", () => {
    const html = renderToStaticMarkup(createElement(FeaturedProducts, { products: [product()] }))
    const imgs = tags(html, "img")
    expect(imgs).toHaveLength(2)
    for (const img of imgs) expect(attr(img, "alt")).toBe("")
  })
})

describe("Header", () => {
  const html = renderToStaticMarkup(createElement(Header))

  it("names every button", () => {
    expect(unnamedButtons(html)).toEqual([])
  })

  it("labels every search box", () => {
    const inputs = tags(html, "input")
    expect(inputs.length).toBeGreaterThan(0)
    for (const input of inputs) expect(attr(input, "aria-label")).toBe("Search custom designs")
  })

  it("marks the current page's link, and only that one", () => {
    const current = tags(html, "a").filter((a) => attr(a, "aria-current") === "page")
    expect(current.length).toBeGreaterThan(0)
    for (const a of current) expect(attr(a, "href")).toBe("/shop")
  })

  it("tells screen readers whether each menu button's menu is open", () => {
    const menuButtons = tags(html, "button").filter((b) => attr(b, "aria-label") === "Open menu")
    expect(menuButtons).toHaveLength(2)
    for (const button of menuButtons) {
      expect(attr(button, "aria-expanded")).toBe("false")
      expect(attr(button, "aria-controls")).toBeTruthy()
    }
  })
})

describe("ShopFilters", () => {
  it("are toggle buttons that say which one is on", () => {
    const html = renderToStaticMarkup(
      createElement(ShopFilters, {
        options: [
          { label: "All", value: "all" },
          { label: "Apparel", value: "apparel-1" },
        ],
        active: "all",
        onChange: () => {},
      }),
    )
    const buttons = tags(html, "button")
    expect(buttons.map((b) => [attr(b, "type"), attr(b, "aria-pressed")])).toEqual([
      ["button", "true"],
      ["button", "false"],
    ])
  })
})

describe("forms", () => {
  it("ContactForm: every field has a label, a visible focus ring, and autofill for name and email", () => {
    const html = renderToStaticMarkup(createElement(ContactForm))
    for (const id of ["cf-name", "cf-email", "cf-subject", "cf-message"]) {
      expect(html).toContain(`for="${id}"`)
      const field = tags(html, "(?:input|select|textarea)").find((tag) => attr(tag, "id") === id)!
      expect(attr(field, "class")).toContain("focus-ring")
    }
    const autocomplete = (id: string) => attr(tags(html, "input").find((tag) => attr(tag, "id") === id)!, "autocomplete")
    expect(autocomplete("cf-name")).toBe("name")
    expect(autocomplete("cf-email")).toBe("email")
  })

  it("EmailSignup: both email boxes have a label and a focus ring", () => {
    const html = renderToStaticMarkup(createElement(EmailSignup))
    const inputs = tags(html, "input")
    expect(inputs).toHaveLength(2)
    for (const input of inputs) {
      expect(html).toContain(`for="${attr(input, "id")}"`)
      expect(attr(input, "class")).toContain("focus-ring")
      expect(attr(input, "autocomplete")).toBe("email")
    }
    expect(unnamedButtons(html)).toEqual([])
  })
})
