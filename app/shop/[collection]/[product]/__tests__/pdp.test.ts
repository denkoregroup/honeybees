import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import type { Product, Variant } from "@/lib/storefront/types"
import { initialSelection } from "@/lib/variant-selection"
import { PDPClient } from "../PDPClient"

const price = (amount: string) => ({ amount, currencyCode: "USD" })
const variant = (id: string, opts: Record<string, string>, amount: string, availableForSale = true): Variant => ({
  id,
  title: Object.values(opts).join(" / "),
  availableForSale,
  price: price(amount),
  compareAtPrice: null,
  selectedOptions: Object.entries(opts).map(([name, value]) => ({ name, value })),
  image: null,
})

const product = {
  id: "gid://shopify/Product/1",
  title: "Tote",
  handle: "tote",
  description: "A tote.",
  tags: [],
  images: [],
  options: [
    { name: "Size", values: ["Small", "Large"] },
    { name: "Color", values: ["Sand", "Blue"] },
  ],
  variants: [
    variant("s-sand", { Size: "Small", Color: "Sand" }, "20.00"),
    variant("l-sand", { Size: "Large", Color: "Sand" }, "26.00"),
    variant("s-blue", { Size: "Small", Color: "Blue" }, "21.00", false),
    variant("l-blue", { Size: "Large", Color: "Blue" }, "28.00"),
  ],
  priceRange: { min: price("20.00"), max: price("28.00") },
} as unknown as Product

function render(params: Record<string, string> = {}) {
  return renderToStaticMarkup(
    createElement(PDPClient, {
      product,
      collectionHandle: "totes",
      preselected: initialSelection(product.options, params),
    })
  )
}

const addToCart = (html: string) => html.match(/<button[^>]*aria-describedby="add-to-cart-help"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? ""

describe("PDP before anything is selected", () => {
  const html = render()

  it("selects no pill", () => {
    expect(html).not.toContain('aria-pressed="true"')
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(4)
  })

  it("shows the lowest price with 'From'", () => {
    expect(html).toMatch(/From<\/span>\$20\.00/)
  })

  it("disables Add to cart, labelled with what is missing, and keeps it visible", () => {
    const button = addToCart(html)
    expect(button).toMatch(/\sdisabled(=|\s|>)/)
    expect(button).toContain("Select size and color")
    expect(button).not.toContain("Add to cart")
  })

  it("has a polite live helper line saying what is missing", () => {
    expect(html).toMatch(/<p id="add-to-cart-help" aria-live="polite"[^>]*>Select size and color to add this to your cart\./)
  })

  it("greys out no value that can be bought", () => {
    expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>(Small|Large|Sand|Blue)/)
    expect(html).not.toContain("line-through")
  })
})

describe("PDP half selected, from the URL", () => {
  const html = render({ Size: "Small" })

  it("selects only the named option, with a check", () => {
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1)
    expect(html).toMatch(/aria-pressed="true"[^>]*>(<svg[^>]*>[\s\S]*?<\/svg>)Small/)
  })

  it("is still disabled and names the missing option", () => {
    expect(addToCart(html)).toContain("Select a color")
    expect(addToCart(html)).toMatch(/\sdisabled(=|\s|>)/)
  })

  it("strikes through a value that is sold out with the options already chosen", () => {
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*line-through[^>]*>Blue/)
  })
})

describe("PDP complete", () => {
  const html = render({ Size: "Large", Color: "Sand" })

  it("shows the exact price, no 'From', and an enabled Add to cart", () => {
    expect(html).toContain("$26.00")
    expect(html).not.toContain(">From<")
    const button = addToCart(html)
    expect(button).not.toMatch(/\sdisabled(=|\s|>)/)
    expect(button).toContain("Add to cart")
  })
})
