import { describe, expect, it } from "vitest"
import type { Variant } from "@/lib/storefront/types"
import {
  fromPrice,
  initialSelection,
  isValueAvailable,
  isOtherColor,
  missingOptions,
  orderedValues,
  pickerOptions,
  purchaseState,
  resolveVariant,
} from "../variant-selection"

const money = { amount: "10.00", currencyCode: "USD" }

function variant(id: string, options: Record<string, string>, availableForSale = true): Variant {
  return {
    id,
    title: Object.values(options).join(" / "),
    availableForSale,
    price: money,
    compareAtPrice: null,
    selectedOptions: Object.entries(options).map(([name, value]) => ({ name, value })),
    image: null,
  }
}

// Size x Color, where Large/Blue was never created and Medium/Blue is unavailable.
const variants = [
  variant("s-red", { Size: "Small", Color: "Red" }),
  variant("s-blue", { Size: "Small", Color: "Blue" }),
  variant("m-red", { Size: "Medium", Color: "Red" }),
  variant("m-blue", { Size: "Medium", Color: "Blue" }, false),
  variant("l-red", { Size: "Large", Color: "Red" }),
]

const options = [
  { name: "Size", values: ["Small", "Medium", "Large"] },
  { name: "Color", values: ["Red", "Blue"] },
]
const priced = (id: string, opts: Record<string, string>, amount: string, available = true): Variant => ({
  ...variant(id, opts, available),
  price: { amount, currencyCode: "USD" },
})
const product = {
  options,
  variants: [
    priced("s-red", { Size: "Small", Color: "Red" }, "20.00"),
    priced("m-red", { Size: "Medium", Color: "Red" }, "24.00"),
    priced("m-blue", { Size: "Medium", Color: "Blue" }, "25.00"),
    priced("l-red", { Size: "Large", Color: "Red" }, "30.00", false),
    priced("l-blue", { Size: "Large", Color: "Blue" }, "32.00"),
  ],
  priceRange: { min: { amount: "20.00", currencyCode: "USD" }, max: { amount: "32.00", currencyCode: "USD" } },
}

describe("initialSelection", () => {
  it("preselects nothing on options with more than one value", () => {
    expect(initialSelection(options)).toEqual({})
  })

  it("auto-selects an option with exactly one value", () => {
    const withOne = [{ name: "Style", values: ["Classic"] }, ...options]
    expect(initialSelection(withOne)).toEqual({ Style: "Classic" })
  })

  it("auto-selects the default title, so a product with no real options is ready to add", () => {
    expect(initialSelection([{ name: "Title", values: ["Default Title"] }])).toEqual({ Title: "Default Title" })
  })

  it("preselects only the options the URL names", () => {
    expect(initialSelection(options, { Size: "Large" })).toEqual({ Size: "Large" })
    expect(initialSelection(options, { Size: "Large", Color: "Blue" })).toEqual({ Size: "Large", Color: "Blue" })
  })

  it("matches URL names and values case-insensitively and takes the first of a repeated value", () => {
    expect(initialSelection(options, { size: "large", COLOR: ["Blue", "Red"] })).toEqual({ Size: "Large", Color: "Blue" })
  })

  it("ignores URL values the product doesn't have, and unrelated parameters", () => {
    expect(initialSelection(options, { Size: "Huge", utm_source: "x" })).toEqual({})
  })
})

describe("missingOptions and resolveVariant", () => {
  it("lists what is still unchosen, in option order", () => {
    expect(missingOptions(options, {})).toEqual(["Size", "Color"])
    expect(missingOptions(options, { Size: "Small" })).toEqual(["Color"])
    expect(missingOptions(options, { Size: "Small", Color: "Red" })).toEqual([])
  })

  it("resolves no variant until every option has a value", () => {
    expect(resolveVariant(product.variants, options, {})).toBeNull()
    expect(resolveVariant(product.variants, options, { Size: "Medium" })).toBeNull()
  })

  it("resolves the matching variant once every option has a value", () => {
    expect(resolveVariant(product.variants, options, { Size: "Medium", Color: "Blue" })?.id).toBe("m-blue")
  })

  it("resolves null for a combination that doesn't exist", () => {
    expect(resolveVariant(product.variants, options, { Size: "Small", Color: "Blue" })).toBeNull()
  })
})

describe("fromPrice", () => {
  it("is the lowest purchasable price when nothing is selected", () => {
    expect(fromPrice(product, {}).amount).toBe("20.00")
  })

  it("ignores unavailable variants", () => {
    const cheapGone = { ...product, variants: product.variants.map((v) => (v.id === "s-red" ? { ...v, availableForSale: false } : v)) }
    expect(fromPrice(cheapGone, {}).amount).toBe("24.00")
  })

  it("narrows to the options already chosen", () => {
    expect(fromPrice(product, { Size: "Large" }).amount).toBe("32.00")
  })

  it("falls back to the product's price range when nothing can be bought", () => {
    const none = { ...product, variants: product.variants.map((v) => ({ ...v, availableForSale: false })) }
    expect(fromPrice(none, {}).amount).toBe("20.00")
  })
})

describe("purchaseState", () => {
  it("before any choice: no variant, a 'From' price, and Add to cart not allowed", () => {
    const state = purchaseState(product, {})
    expect(state.variant).toBeNull()
    expect(state.showFrom).toBe(true)
    expect(state.price.amount).toBe("20.00")
    expect(state.canAdd).toBe(false)
  })

  it("half selected: still no variant and not allowed; the 'From' price narrows to what is chosen", () => {
    const state = purchaseState(product, { Size: "Medium" })
    expect(state.variant).toBeNull()
    expect(state.canAdd).toBe(false)
    expect(state.showFrom).toBe(true)
    expect(state.price.amount).toBe("24.00")
  })

  it("complete: the resolved variant, its exact price, and Add to cart allowed", () => {
    const state = purchaseState(product, { Size: "Medium", Color: "Blue" })
    expect(state.variant?.id).toBe("m-blue")
    expect(state.showFrom).toBe(false)
    expect(state.price.amount).toBe("25.00")
    expect(state.canAdd).toBe(true)
  })

  it("a complete selection that is sold out can't be added", () => {
    const state = purchaseState(product, { Size: "Large", Color: "Red" })
    expect(state.variant?.id).toBe("l-red")
    expect(state.canAdd).toBe(false)
  })

  it("a complete selection that doesn't exist can't be added", () => {
    const state = purchaseState(product, { Size: "Small", Color: "Blue" })
    expect(state.variant).toBeNull()
    expect(state.canAdd).toBe(false)
  })

  it("a product with only a default title is ready to add straight away", () => {
    const plain = {
      options: [{ name: "Title", values: ["Default Title"] }],
      variants: [priced("only", { Title: "Default Title" }, "9.00")],
      priceRange: { min: { amount: "9.00", currencyCode: "USD" }, max: { amount: "9.00", currencyCode: "USD" } },
    }
    const state = purchaseState(plain, initialSelection(plain.options))
    expect(state.canAdd).toBe(true)
    expect(state.showFrom).toBe(false)
  })
})

describe("isValueAvailable", () => {
  it("is true when a purchasable variant has the value, whatever the other options", () => {
    expect(isValueAvailable(variants, "Size", "Large")).toBe(true)
    expect(isValueAvailable(variants, "Color", "Blue")).toBe(true)
  })

  it("checks the value against the other options already chosen", () => {
    expect(isValueAvailable(product.variants, "Size", "Large", { Color: "Red" })).toBe(false) // Large/Red is sold out
    expect(isValueAvailable(product.variants, "Size", "Large", { Color: "Blue" })).toBe(true)
    expect(isValueAvailable(product.variants, "Color", "Blue", { Size: "Small" })).toBe(false) // no Small/Blue
  })

  it("ignores the option's own current choice, so it can always be switched", () => {
    expect(isValueAvailable(product.variants, "Size", "Medium", { Size: "Large", Color: "Blue" })).toBe(true)
  })

  it("greys nothing out with nothing selected, for any value that can be bought", () => {
    for (const option of options) {
      for (const value of option.values) expect(isValueAvailable(product.variants, option.name, value, {})).toBe(true)
    }
  })

  it("is false when every variant with the value is unavailable", () => {
    const onlyUnavailableBlue = variants.filter((v) => v.id !== "s-blue")
    expect(isValueAvailable(onlyUnavailableBlue, "Color", "Blue")).toBe(false)
  })
})

describe("pickerOptions", () => {
  it("is empty for a default-title product", () => {
    expect(pickerOptions({ options: [{ name: "Title", values: ["Default Title"] }] })).toEqual([])
  })

  it("keeps only options with a choice to make", () => {
    const options = [
      { name: "Size", values: ["Small", "Large"] },
      { name: "Style", values: ["Classic"] },
      { name: "Color", values: ["Red", "Blue"] },
    ]
    expect(pickerOptions({ options }).map((o) => o.name)).toEqual(["Size", "Color"])
  })
})

// A product whose Color has an "Other" value, listed first by Shopify to show that it still sorts last.
const withOther = {
  options: [
    { name: "Size", values: ["Small", "Large"] },
    { name: "Color", values: ["Other", "Sand", "Blue"] },
  ],
  variants: [
    priced("s-sand", { Size: "Small", Color: "Sand" }, "20.00"),
    priced("s-other", { Size: "Small", Color: "Other" }, "20.00"),
    priced("l-sand", { Size: "Large", Color: "Sand" }, "26.00"),
    priced("l-other", { Size: "Large", Color: "Other" }, "26.00"),
  ],
  priceRange: { min: { amount: "20.00", currencyCode: "USD" }, max: { amount: "26.00", currencyCode: "USD" } },
}

describe("orderedValues", () => {
  it("puts 'Other' last in the Color row and keeps the rest in Shopify's order", () => {
    expect(orderedValues(withOther.options[1])).toEqual(["Sand", "Blue", "Other"])
  })

  it("leaves an option without 'Other' exactly as it is", () => {
    for (const option of options) expect(orderedValues(option)).toBe(option.values)
  })

  it("only treats 'Other' as special in the Color option, and only when named exactly 'Other'", () => {
    const size = { name: "Size", values: ["Other", "Small"] }
    expect(orderedValues(size)).toBe(size.values)
    const lower = { name: "Color", values: ["other", "Red"] }
    expect(orderedValues(lower)).toBe(lower.values)
    expect(isOtherColor("Color", "Other")).toBe(true)
    expect(isOtherColor("Color", "other")).toBe(false)
    expect(isOtherColor("Size", "Other")).toBe(false)
  })
})

describe("purchaseState with 'Other'", () => {
  const other = { Size: "Large", Color: "Other" }

  it("is disabled while the box is empty, or holds only spaces", () => {
    expect(purchaseState(withOther, other, "").canAdd).toBe(false)
    expect(purchaseState(withOther, other, "   ").canAdd).toBe(false)
  })

  it("is enabled once there is a non-space character, and sends the trimmed text", () => {
    const state = purchaseState(withOther, other, "  Forest green ")
    expect(state.canAdd).toBe(true)
    expect(state.requestedColor).toBe("Forest green")
    expect(state.variant?.id).toBe("l-other")
    expect(state.price.amount).toBe("26.00")
  })

  it("still needs every option, even with a typed color", () => {
    const state = purchaseState(withOther, { Color: "Other" }, "Forest green")
    expect(state.canAdd).toBe(false)
    expect(state.requestedColor).toBeNull()
  })

  it("sends no color for a normal color, even if text was typed before switching back", () => {
    const state = purchaseState(withOther, { Size: "Large", Color: "Sand" }, "Forest green")
    expect(state.canAdd).toBe(true)
    expect(state.requestedColor).toBeNull()
  })

  it("follows the variant's availability like any other color", () => {
    const soldOut = { ...withOther, variants: withOther.variants.map((v) => (v.id === "l-other" ? { ...v, availableForSale: false } : v)) }
    expect(purchaseState(soldOut, other, "Forest green").canAdd).toBe(false)
  })
})

describe("products without 'Other' are unchanged", () => {
  it("send no requested color and ignore any typed text", () => {
    const state = purchaseState(product, { Size: "Medium", Color: "Blue" }, "Forest green")
    expect(state.canAdd).toBe(true)
    expect(state.requestedColor).toBeNull()
    expect(purchaseState(product, { Size: "Medium", Color: "Blue" })).toEqual(
      purchaseState(product, { Size: "Medium", Color: "Blue" }, "x")
    )
  })
})
