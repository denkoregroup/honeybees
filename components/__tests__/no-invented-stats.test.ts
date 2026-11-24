import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { TrustBar } from "../home/TrustBar"

// The site must not state customer counts, order counts, review counts or ratings that aren't backed by real
// data. "5,000+ Happy Customers" was a design placeholder.
const INVENTED_STAT = /\d[\d,.]*\+?\s*(?:k\s+)?(?:happy\s+|satisfied\s+)?(?:customers|reviews|orders|families|sales|sold)\b|★|(?<![\[\d.])\b\d(?:\.\d)?\s*(?:\/\s*5\b|stars?\b)|⭐/i

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (name === "node_modules" || name === ".next" || name === "__tests__") return []
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(tsx?|md)$/.test(name) ? [path] : []
  })
}

describe("no invented statistics", () => {
  it("appear nowhere in the app, components, lib or README source", () => {
    const root = join(__dirname, "..", "..")
    const files = [...sourceFiles(join(root, "app")), ...sourceFiles(join(root, "components")), ...sourceFiles(join(root, "lib")), join(root, "README.md")]
    const offenders = files.filter((file) => INVENTED_STAT.test(readFileSync(file, "utf8"))).map((file) => file.replace(root, ""))
    expect(offenders).toEqual([])
  })

  it("is a pattern that catches the old claim", () => {
    expect("5,000+ Happy Customers").toMatch(INVENTED_STAT)
    expect("10k orders shipped").toMatch(INVENTED_STAT)
    expect("Rated 4.9 stars").toMatch(INVENTED_STAT)
    expect("4.8/5 on reviews").toMatch(INVENTED_STAT)
    expect("aspect-[4/5]").not.toMatch(INVENTED_STAT) // a CSS class, not a rating
    expect("Made with Love").not.toMatch(INVENTED_STAT)
  })

  it("leaves the trust bar with one filled column per item and no blank one", () => {
    const html = renderToStaticMarkup(createElement(TrustBar))
    expect(html).toContain("grid-template-columns:repeat(3, 1fr)")
    expect(html.match(/<p /g)).toHaveLength(6) // a title and a description in each of the three columns
  })
})
