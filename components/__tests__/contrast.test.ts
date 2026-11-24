import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// WCAG 2.1 AA contrast: 4.5:1 for normal text, 3:1 for large text (24px, or 18.66px bold) and UI parts.
const AA_TEXT = 4.5
const AA_LARGE = 3

const root = join(__dirname, "..", "..")
const css = readFileSync(join(root, "app", "globals.css"), "utf8")
const rootBlock = css.slice(css.indexOf(":root {"), css.indexOf("@theme inline"))

/** The value of a custom property in :root, following var() references. */
function token(name: string): string {
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(rootBlock)
  if (!match) throw new Error(`--${name} is not defined in :root`)
  const value = match[1].trim()
  const ref = /^var\(--([\w-]+)\)$/.exec(value)
  return ref ? token(ref[1]) : value
}

/** Linear-light sRGB channels for an `oklch(L C H)` value (Björn Ottosson's OKLab matrices). */
function linearRgb(oklch: string): number[] {
  const parts = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(oklch)
  if (!parts) throw new Error(`not an oklch() color: ${oklch}`)
  const [L, C, H] = parts.slice(1).map(Number)
  const a = C * Math.cos((H * Math.PI) / 180)
  const b = C * Math.sin((H * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => Math.min(1, Math.max(0, c)))
}

function contrast(foreground: string, background: string): number {
  const luminance = (name: string) => {
    const [r, g, b] = linearRgb(name === "white" ? "oklch(1 0 0)" : token(name))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const [hi, lo] = [luminance(foreground), luminance(background)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe("brand palette contrast (WCAG AA)", () => {
  it("text on the blush fill is ink, never white", () => {
    expect(contrast("color-ink", "color-blush")).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrast("color-ink", "color-blush-dark")).toBeGreaterThanOrEqual(AA_TEXT)
    expect(token("primary-foreground")).toBe(token("color-ink"))
    // Why: white on blush is about 1.7:1
    expect(contrast("white", "color-blush")).toBeLessThan(AA_LARGE)
  })

  it("focus rings are ink, which shows on every light ground", () => {
    expect(token("ring")).toBe(token("color-ink"))
    for (const ground of ["color-cream", "color-surface", "color-blush"]) {
      expect(contrast("ring", ground)).toBeGreaterThanOrEqual(AA_LARGE)
    }
  })

  it("coral-ink passes for small text and coral-display for large text on white and cream", () => {
    for (const ground of ["color-surface", "color-cream"]) {
      expect(contrast("color-coral-ink", ground)).toBeGreaterThanOrEqual(AA_TEXT)
      expect(contrast("color-coral-display", ground)).toBeGreaterThanOrEqual(AA_LARGE)
      // Why the darker variants exist: blush and sunflower text fail even the large-text bar
      expect(contrast("color-blush", ground)).toBeLessThan(AA_LARGE)
      expect(contrast("color-sunflower", ground)).toBeLessThan(AA_LARGE)
    }
  })

  it("gray secondary text passes on every light ground it is used on", () => {
    for (const ground of ["color-surface", "color-cream", "color-warm-beige", "color-gray-light"]) {
      expect(contrast("color-gray", ground)).toBeGreaterThanOrEqual(AA_TEXT)
    }
  })
})

function componentFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (name === "__tests__" || name === "emails") return []
    if (statSync(path).isDirectory()) return componentFiles(path)
    return name.endsWith(".tsx") ? [path] : []
  })
}

// Not rendered by any page, so not checked: components/header.tsx (slated for deletion in #36) and
// four leftovers that nothing imports.
const UNUSED = ["header.tsx", "home/CustomOrderCTA.tsx", "home/MarqueeBar.tsx", "features/BundleCard.tsx", "features/CollectionFilter.tsx"]
const sources = componentFiles(join(root, "components"))
  .filter((file) => !UNUSED.some((unused) => file.endsWith(join("components", unused))))
  .map((file) => ({ file: file.replace(root, ""), text: readFileSync(file, "utf8") }))

// A blush fill (blush, coral and primary are all blush) but not coral-ink, coral-display or coral-light.
const BLUSH_FILL = /bg-\[var\(--color-(blush|coral|primary)(-dark)?\)\]/
const BLUSH_FILL_STYLE = /backgroundColor: "var\(--color-(blush|coral|primary)(-dark)?\)"/

describe("components", () => {
  it("never put white text on a blush fill", () => {
    const offenders = sources.flatMap(({ file, text }) => [
      // In one class string (className="..." or a string in a class list)
      ...[...text.matchAll(/"([^"\n]*)"/g)]
        .filter(([, classes]) => BLUSH_FILL.test(classes) && /\btext-white\b/.test(classes))
        .map(([match]) => `${file}: ${match}`),
      // On one element: a blush class or style background, and white text by class or style
      ...[...text.matchAll(/<[A-Za-z.]+\b[^<>]*>/g)]
        .map(([tag]) => tag)
        .filter((tag) => (BLUSH_FILL.test(tag) || BLUSH_FILL_STYLE.test(tag)) && /\btext-white\b|color: "white"/.test(tag))
        .map((tag) => `${file}: ${tag.slice(0, 80)}`),
    ])
    expect(offenders).toEqual([])
  })

  it("never use blush, sunflower or honey as a text color class (too faint on light grounds)", () => {
    const offenders = sources.flatMap(({ file, text }) =>
      [...text.matchAll(/(?<![\w:-])text-\[var\(--color-(blush|coral|primary|sunflower|honey|honey-yellow|gold)\)\]/g)].map(
        ([match]) => `${file}: ${match}`,
      ),
    )
    expect(offenders).toEqual([])
  })

  it("the white-on-blush check catches both forms", () => {
    const tag = (s: string) => /<[A-Za-z.]+\b[^<>]*>/.exec(s)?.[0] ?? ""
    const styled = tag(`<span className="x" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>`)
    expect(BLUSH_FILL_STYLE.test(styled) && /color: "white"/.test(styled)).toBe(true)
    expect(BLUSH_FILL.test("rounded bg-[var(--color-coral)] text-white")).toBe(true)
    expect(BLUSH_FILL.test("bg-[var(--color-coral-ink)] text-white")).toBe(false)
  })
})

describe("blush on the ink panel (app/collections/page.tsx)", () => {
  it("blush text on an ink fill passes for small text", () => {
    expect(contrast("color-blush", "color-ink")).toBeGreaterThanOrEqual(AA_TEXT)
  })
})
