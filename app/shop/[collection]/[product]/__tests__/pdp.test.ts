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

function render(params: Record<string, string> = {}, shown: Product = product) {
  return renderToStaticMarkup(
    createElement(PDPClient, {
      product: shown,
      collectionHandle: "totes",
      preselected: initialSelection(shown.options, params),
    })
  )
}

// The Add to cart button is the only one with the btn-cta class
const addToCart = (html: string) => html.match(/<button[^>]*btn-cta[^>]*>[\s\S]*?<\/button>/)?.[0] ?? ""
const visibleText = (button: string) => button.replace(/<[^>]*>/g, "").trim()

describe("PDP before anything is selected", () => {
  const html = render()

  it("selects no pill", () => {
    expect(html).not.toContain('aria-pressed="true"')
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(4)
  })

  it("shows the lowest price with 'From'", () => {
    expect(html).toMatch(/From<\/span>\$20\.00/)
  })

  it("disables Add to cart (still visible, label unchanged)", () => {
    const button = addToCart(html)
    expect(button).toMatch(/\sdisabled(=|\s|>)/)
    expect(visibleText(button)).toBe("Add to cart")
  })

  it("shows no message about what is missing", () => {
    expect(html).not.toContain("aria-live")
    expect(html).not.toMatch(/Select (a |an )?(size|color|option)/i)
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

  it("is still disabled, with the same label", () => {
    expect(visibleText(addToCart(html))).toBe("Add to cart")
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
    expect(visibleText(button)).toBe("Add to cart")
  })
})

// A product with an "Other" color, which Shopify lists first
const withOther = {
  ...product,
  options: [
    { name: "Size", values: ["Small", "Large"] },
    { name: "Color", values: ["Other", "Sand", "Blue"] },
  ],
  variants: [
    variant("s-sand", { Size: "Small", Color: "Sand" }, "20.00"),
    variant("s-other", { Size: "Small", Color: "Other" }, "20.00"),
    variant("l-other", { Size: "Large", Color: "Other" }, "26.00"),
    variant("l-sand", { Size: "Large", Color: "Sand" }, "26.00"),
    variant("l-blue", { Size: "Large", Color: "Blue" }, "28.00"),
  ],
} as unknown as Product

const pills = (html: string, group: string) =>
  [...html.match(new RegExp(`aria-labelledby="${group}"[\\s\\S]*?<\\/div><\\/div>`))![0].matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map((m) =>
    m[1].replace(/<[^>]*>/g, "")
  )

describe("PDP with an 'Other' color", () => {
  it("lists 'Other (request a color)' last in the Color row", () => {
    expect(pills(render({}, withOther), "option-color")).toEqual(["Sand", "Blue", "Other (request a color)"])
  })

  it("never strikes 'Other' through or disables it", () => {
    const html = render({}, withOther)
    expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>[^<]*Other/)
  })

  it("shows the text box only once 'Other' is chosen, with its label, placeholder, limit and note", () => {
    expect(render({}, withOther)).not.toContain("requested-color")
    expect(render({ Color: "Sand" }, withOther)).not.toContain("requested-color")

    const html = render({ Color: "Other" }, withOther)
    expect(html).toContain("Which color would you like?")
    expect(html).toMatch(/<input[^>]*id="requested-color"[^>]*maxLength="40"[^>]*placeholder="e\.g\. Forest green"/)
    expect(html).toContain("We&#x27;ll confirm your color within 1 business day.")
  })

  it("puts the text box directly under the Color row", () => {
    const html = render({ Color: "Other" }, withOther)
    expect(html.indexOf('id="requested-color"')).toBeGreaterThan(html.indexOf('aria-labelledby="option-color"'))
    expect(html.indexOf('id="requested-color"')).toBeLessThan(html.indexOf("btn-cta"))
  })

  it("keeps Add to cart disabled and labelled 'Add to cart' while the box is empty, with no helper text", () => {
    const html = render({ Size: "Large", Color: "Other" }, withOther)
    const button = addToCart(html)
    expect(button).toMatch(/\sdisabled(=|\s|>)/)
    expect(visibleText(button)).toBe("Add to cart")
    expect(html).not.toContain("aria-live")
  })
})

describe("PDP for a product without 'Other'", () => {
  it("has no text box, no 'request a color' label, and the pills in Shopify's order", () => {
    const html = render({ Size: "Large", Color: "Sand" })
    expect(html).not.toContain("requested-color")
    expect(html).not.toContain("request a color")
    expect(pills(html, "option-color")).toEqual(["Sand", "Blue"])
  })
})
