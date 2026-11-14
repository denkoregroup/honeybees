import { describe, expect, it } from "vitest"
import { pageVariables } from "../pagination"

describe("pageVariables", () => {
  it("uses the default size when first is omitted", () => {
    expect(pageVariables({}, 24)).toEqual({ first: 24, after: null })
  })

  it("uses an explicit size", () => {
    expect(pageVariables({ first: 10 }, 24).first).toBe(10)
  })

  it("accepts the bounds 1 and 250", () => {
    expect(pageVariables({ first: 1 }, 24).first).toBe(1)
    expect(pageVariables({ first: 250 }, 24).first).toBe(250)
  })

  it.each([
    ["0", 0],
    ["251", 251],
    ["a negative number", -1],
    ["a non-integer", 1.5],
    ["NaN", Number.NaN],
  ])("rejects %s", (_label, first) => {
    expect(() => pageVariables({ first }, 24)).toThrow(RangeError)
  })

  it("defaults after to null and passes a cursor through", () => {
    expect(pageVariables({}, 24).after).toBeNull()
    expect(pageVariables({ after: undefined }, 24).after).toBeNull()
    expect(pageVariables({ after: null }, 24).after).toBeNull()
    expect(pageVariables({ after: "cursor-1" }, 24).after).toBe("cursor-1")
  })
})
