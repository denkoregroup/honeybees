import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { CATEGORIES } from "../categories"
import { CategoryGrid } from "../CategoryGrid"
import type { CollectionTile } from "../collection-tiles"

// Collections that exist in Shopify and have products. Changing this list is a deliberate act.
const ALLOWED_HANDLES = [
  "apparel-1",
  "turtley-awesome-merch",
  "turtley-coasters",
  "turtley-decals",
  "turtley-keychains",
]

const PHOTO = { url: "https://cdn.shopify.com/s/files/1/coasters.png?v=1", altText: null, width: 800, height: 800 }

function shopLinks(html: string): string[] {
  return [...html.matchAll(/href="(\/shop\/[^"]*)"/g)].map((m) => m[1])
}

const tiles: CollectionTile[] = CATEGORIES.map(({ name, handle }) => ({ name, handle, image: null }))
const render = (t: CollectionTile[]) => renderToStaticMarkup(createElement(CategoryGrid, { tiles: t }))

describe("CATEGORIES", () => {
  it("only lists allowed collection handles", () => {
    for (const { handle } of CATEGORIES) expect(ALLOWED_HANDLES).toContain(handle)
  })

  it("has no duplicate handles", () => {
    const handles = CATEGORIES.map((c) => c.handle)
    expect(new Set(handles).size).toBe(handles.length)
  })
})

describe("CategoryGrid", () => {
  it("renders every tile in both the mobile and desktop markup", () => {
    const links = shopLinks(render(tiles))
    for (const { handle } of tiles) {
      expect(links.filter((l) => l === `/shop/${handle}`)).toHaveLength(2)
    }
  })

  it("shows the tile's photo as decoration, since the tile's name is already in the link", () => {
    const html = render([{ name: "TURTLEY COASTERS", handle: "turtley-coasters", image: PHOTO }])
    const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag)
    expect(imgs).toHaveLength(2)
    for (const img of imgs) {
      expect(img).toContain('alt=""')
      expect(img).toContain(encodeURIComponent(PHOTO.url))
    }
  })

  it("keeps the placeholder icon when a tile has no photo", () => {
    expect(render(tiles)).not.toContain("<img")
  })

  it("renders nothing when there are no tiles", () => {
    expect(render([])).toBe("")
  })
})
