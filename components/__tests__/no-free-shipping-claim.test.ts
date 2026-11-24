import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { PromoBanners } from "../home/PromoBanners"
import { TrustBar } from "../home/TrustBar"
import { TopBar } from "../layout/TopBar"

// Shopify has one flat shipping rate and no free-shipping rule, so no page may promise free shipping.
const CLAIM = /free\s+ship|\$\s?75/i

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (name === "node_modules" || name === ".next" || name === "__tests__") return []
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(tsx?|md)$/.test(name) ? [path] : []
  })
}

describe("no free-shipping claim", () => {
  it("appears nowhere in the app, components, lib or README source", () => {
    const root = join(__dirname, "..", "..")
    const files = [...sourceFiles(join(root, "app")), ...sourceFiles(join(root, "components")), ...sourceFiles(join(root, "lib")), join(root, "README.md")]
    const offenders = files.filter((file) => CLAIM.test(readFileSync(file, "utf8"))).map((file) => file.replace(root, ""))
    expect(offenders).toEqual([])
  })

  it("is absent from the rendered top bar, trust bar and promo banners", () => {
    for (const component of [TopBar, TrustBar, PromoBanners]) {
      expect(renderToStaticMarkup(createElement(component))).not.toMatch(CLAIM)
    }
  })

  it("leaves the trust bar with its three tagline items", () => {
    const html = renderToStaticMarkup(createElement(TrustBar))
    for (const title of ["MADE WITH LOVE", "PACKED WITH CARE", "SHIPPED WITH SMILES"]) {
      expect(html).toContain(title)
    }
  })

  it("has a mobile announcement strip, but with no shipping claim in it", () => {
    const html = renderToStaticMarkup(createElement(TopBar))
    expect(html).toContain("md:hidden")
    expect(html).toContain("Site announcements")
    expect(html).not.toMatch(CLAIM)
  })
})
