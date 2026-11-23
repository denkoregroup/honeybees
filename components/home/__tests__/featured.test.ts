import { describe, expect, it } from "vitest"
import { MOBILE_FEATURED_COUNT, mobileFeatured } from "../featured"

describe("mobileFeatured", () => {
  it("keeps the first four of twelve products, in order", () => {
    const products = Array.from({ length: 12 }, (_, i) => i)
    expect(mobileFeatured(products)).toEqual([0, 1, 2, 3])
    expect(MOBILE_FEATURED_COUNT).toBe(4)
  })

  it("shows all of them when there are fewer than four", () => {
    expect(mobileFeatured([1, 2])).toEqual([1, 2])
    expect(mobileFeatured([])).toEqual([])
  })

  it("does not change the list it is given", () => {
    const products = [1, 2, 3, 4, 5]
    mobileFeatured(products)
    expect(products).toHaveLength(5)
  })
})
