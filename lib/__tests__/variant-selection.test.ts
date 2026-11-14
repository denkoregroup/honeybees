import { describe, expect, it } from "vitest"
import type { Variant } from "@/lib/storefront/types"
import { initialVariant, isValueAvailable, pickerOptions, selectValue } from "../variant-selection"

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

describe("initialVariant", () => {
  it("is the first purchasable variant", () => {
    expect(initialVariant([variant("a", { Size: "S" }, false), variant("b", { Size: "M" })])?.id).toBe("b")
  })

  it("is null when nothing can be bought", () => {
    expect(initialVariant([variant("a", { Size: "S" }, false)])).toBeNull()
  })
})

describe("selectValue", () => {
  it("keeps the other options when that combination can be bought", () => {
    const current = variants[0] // Small / Red
    expect(selectValue(variants, current, "Size", "Medium")?.id).toBe("m-red")
    expect(selectValue(variants, current, "Color", "Blue")?.id).toBe("s-blue")
  })

  it("switches the other options when the combination does not exist", () => {
    const current = variants[1] // Small / Blue; there is no Large / Blue
    expect(selectValue(variants, current, "Size", "Large")?.id).toBe("l-red")
  })

  it("switches the other options when the combination is unavailable", () => {
    const current = variants[1] // Small / Blue; Medium / Blue is unavailable
    expect(selectValue(variants, current, "Size", "Medium")?.id).toBe("m-red")
  })

  it("returns null for a value no purchasable variant has", () => {
    expect(selectValue(variants, variants[0], "Color", "Green")).toBeNull()
  })
})

describe("isValueAvailable", () => {
  it("is true when a purchasable variant has the value, whatever the other options", () => {
    expect(isValueAvailable(variants, "Size", "Large")).toBe(true)
    expect(isValueAvailable(variants, "Color", "Blue")).toBe(true)
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
