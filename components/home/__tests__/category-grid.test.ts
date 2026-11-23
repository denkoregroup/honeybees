import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { CATEGORIES, CategoryGrid } from "../CategoryGrid"

// Collections that exist in Shopify and have products. Changing this list is a deliberate act.
const ALLOWED_HANDLES = [
  "apparel-1",
  "turtley-awesome-merch",
  "turtley-coasters",
  "turtley-decals",
  "turtley-keychains",
]

function shopLinks(html: string): string[] {
  return [...html.matchAll(/href="(\/shop\/[^"]*)"/g)].map((m) => m[1])
}

describe("CategoryGrid", () => {
  const html = renderToStaticMarkup(createElement(CategoryGrid))
  const links = shopLinks(html)

  it("only links to allowed collection handles", () => {
    expect(links.length).toBeGreaterThan(0)
    for (const href of links) {
      expect(ALLOWED_HANDLES).toContain(href.replace("/shop/", ""))
    }
  })

  it("renders every category in both the mobile and desktop markup", () => {
    for (const { handle } of CATEGORIES) {
      expect(links.filter((l) => l === `/shop/${handle}`)).toHaveLength(2)
    }
  })

  it("has no duplicate handles", () => {
    const handles = CATEGORIES.map((c) => c.handle)
    expect(new Set(handles).size).toBe(handles.length)
  })
})
