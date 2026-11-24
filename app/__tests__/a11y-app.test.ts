import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { createElement, isValidElement, type ReactElement, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { Cart, Product } from "@/lib/storefront/types"
import CartPage from "../cart/page"
import { PDPClient } from "../shop/[collection]/[product]/PDPClient"

// The same rules components/__tests__/contrast.test.ts applies to components/, here for the pages in app/.

// The layout imports Google fonts and the footer reads Shopify.
vi.mock("@/lib/storefront", () => ({}))
// Zustand serves its initial state when rendering on the server, so the cart page gets a fixed snapshot.
const cartState = vi.hoisted(() => ({ current: {} as Record<string, unknown> }))
vi.mock("@/store/cart", () => ({ useCartStore: () => cartState.current }))
vi.mock("next/font/google", () => {
  const font = () => ({ variable: "font" })
  return { Inter: font, Montserrat: font, Pacifico: font }
})
vi.mock("next/navigation", () => ({ usePathname: () => "/" }))

const root = join(__dirname, "..", "..")

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (name === "__tests__") return []
    if (statSync(path).isDirectory()) return tsxFiles(path)
    return name.endsWith(".tsx") ? [path] : []
  })
}

const pages = tsxFiles(join(root, "app")).map((file) => ({ file: relative(root, file), text: readFileSync(file, "utf8") }))

/** Every match of a pattern across the app's .tsx files, as "file: match". */
const find = (pattern: RegExp) =>
  pages.flatMap(({ file, text }) => [...text.matchAll(pattern)].map(([match]) => `${file}: ${match}`))

// A blush fill (blush, coral and primary are all blush) but not coral-ink, coral-display or coral-light.
const BLUSH_FILL = /bg-\[var\(--color-(blush|coral|primary)(-dark)?\)\]/
// Any variant too (hover:, group-hover:): a hover color still has to be readable.
const FAINT_TEXT = /text-\[var\(--color-(blush|coral|primary|sunflower|honey|honey-yellow|gold)\)\]|(?<![\w-])text-primary(?![\w-])/g

describe("app pages: colour contrast", () => {
  it("never put white text on a blush fill", () => {
    const offenders = pages.flatMap(({ file, text }) =>
      [...text.matchAll(/"([^"\n]*)"/g)]
        .filter(([, classes]) => BLUSH_FILL.test(classes) && /\btext-white\b/.test(classes))
        .map(([match]) => `${file}: ${match}`),
    )
    expect(offenders).toEqual([])
  })

  it("never use blush, sunflower or honey as a text color, hover included, except on the ink panel", () => {
    // The custom order panel on /collections is ink, where blush text is about 11:1 (see contrast.test.ts).
    const onInkPanel = [
      "app/collections/page.tsx: text-[var(--color-coral)]",
      "app/collections/page.tsx: text-[var(--color-coral)]",
    ]
    expect(find(FAINT_TEXT)).toEqual(onInkPanel)
    expect(pages.find(({ file }) => file === "app/collections/page.tsx")?.text).toMatch(
      /bg-\[var\(--color-ink\)\][^\n]*\n\s*\{\/\* Blush on the ink panel[^\n]*\n[^\n]*text-\[var\(--color-coral\)\]/,
    )
  })

  it("never use a blush border, which is 1.7:1 on white", () => {
    expect(find(/border-\[var\(--color-(blush|coral|primary)(-dark)?\)\]/g)).toEqual([])
  })

  it("never use red-500 or red-600 text (below 4.5:1 on white and red-50)", () => {
    expect(find(/text-red-(500|600)\b/g)).toEqual([])
  })

  it("the checks catch the patterns they look for", () => {
    expect(BLUSH_FILL.test("rounded-full bg-[var(--color-coral)] text-white")).toBe(true)
    expect(BLUSH_FILL.test("bg-[var(--color-coral-ink)] text-white")).toBe(false)
    const faint = (s: string) => [...s.matchAll(FAINT_TEXT)].length
    expect(faint("hover:text-[var(--color-coral)]")).toBe(1)
    expect(faint("text-primary fill-primary/20")).toBe(1)
    expect(faint("text-[var(--color-coral-ink)] text-primary-foreground")).toBe(0)
  })
})

/** Every element of the given type in a tree of elements (function components are not called). */
function all(node: ReactNode, type: string): ReactElement<Record<string, unknown>>[] {
  if (Array.isArray(node)) return node.flatMap((child) => all(child, type))
  if (!isValidElement<{ children?: ReactNode }>(node)) return []
  const self = node.type === type ? [node as ReactElement<Record<string, unknown>>] : []
  return [...self, ...all(node.props.children, type)]
}

describe("skip link", () => {
  it("is the first thing in the body, hidden until focused, and points at the main content", async () => {
    const { default: RootLayout } = await import("../layout")
    const tree = RootLayout({ children: "page" })
    const [body] = all(tree, "body")
    const [first] = ([] as ReactNode[]).concat(body.props.children as ReactNode).filter(isValidElement)
    expect(first.type).toBe("a")
    const link = first as ReactElement<{ href: string; className: string; children: ReactNode }>
    expect(link.props.children).toBe("Skip to main content")
    expect(link.props.className.split(" ")).toEqual(expect.arrayContaining(["sr-only", "focus:not-sr-only", "focus-ring"]))

    const mains = all(tree, "main")
    expect(mains).toHaveLength(1)
    expect(link.props.href).toBe(`#${mains[0].props.id}`)
    expect(mains[0].props.id).toBe("main-content")
  })

  it("no page or component renders a second <main> inside the layout's", () => {
    // global-error.tsx replaces the root layout, so its own <main> is the only one on that page.
    const sources = [...pages, ...tsxFiles(join(root, "components")).map((file) => ({ file: relative(root, file), text: readFileSync(file, "utf8") }))]
    const withMain = sources.filter(({ text }) => /<main\b/.test(text)).map(({ file }) => file)
    expect(withMain.sort()).toEqual(["app/global-error.tsx", "app/layout.tsx"])
  })
})

const tags = (html: string, name: string) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map(([tag]) => tag)
const attr = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`, "i").exec(tag)?.[1]

describe("product page photos", () => {
  const image = (url: string, altText: string | null) => ({ url, altText, width: 800, height: 800 })
  const product = (images: ReturnType<typeof image>[]) =>
    ({
      id: "gid://shopify/Product/1",
      title: "Shell Yeah",
      handle: "shell-yeah",
      description: "A shirt.",
      tags: [],
      images,
      options: [],
      variants: [],
      priceRange: { min: { amount: "20.0", currencyCode: "USD" }, max: { amount: "20.0", currencyCode: "USD" } },
    }) as unknown as Product
  const render = (images: ReturnType<typeof image>[]) =>
    renderToStaticMarkup(createElement(PDPClient, { product: product(images), collection: null, preselected: {} }))

  it.each([
    ["empty", ""],
    ["missing", null],
  ])("the main photo is named after the product when Shopify's alt text is %s", (_, altText) => {
    const [main] = tags(render([image("https://cdn.shopify.com/a.png", altText)]), "img")
    expect(attr(main, "alt")).toBe("Shell Yeah")
  })

  it("the main photo uses Sarah's alt text when she sets one", () => {
    const [main] = tags(render([image("https://cdn.shopify.com/a.png", "Green turtle tee")]), "img")
    expect(attr(main, "alt")).toBe("Green turtle tee")
  })

  it("each thumbnail button has a name and says which photo is showing", () => {
    const html = render([image("https://cdn.shopify.com/a.png", ""), image("https://cdn.shopify.com/b.png", "")])
    const buttons = tags(html, "button").filter((b) => attr(b, "aria-label")?.startsWith("Show photo"))
    expect(buttons.map((b) => [attr(b, "aria-label"), attr(b, "aria-pressed")])).toEqual([
      ["Show photo 1 of 2", "true"],
      ["Show photo 2 of 2", "false"],
    ])
    // The thumbnail images are decorative inside their labelled buttons
    expect(tags(html, "img").slice(1).map((img) => attr(img, "alt"))).toEqual(["", ""])
  })
})

describe("cart page", () => {
  const usd = (amount: string) => ({ amount, currencyCode: "USD" })
  const cart: Cart = {
    lines: [
      {
        id: "line-1",
        title: "Shell Yeah",
        variantTitle: "Default Title",
        image: { url: "https://cdn.shopify.com/a.png", altText: null, width: 800, height: 800 },
        quantity: 1,
        unitPrice: usd("20.0"),
        totalPrice: usd("20.0"),
        attributes: [],
      },
    ],
    totalQuantity: 1,
    subtotal: usd("20.0"),
    total: usd("20.0"),
    checkoutUrl: "https://example.myshopify.com/cart/c/1",
  }

  it("names each line's buttons after the product, and its photo is decorative", () => {
    cartState.current = { cart, loaded: true, isPending: false, error: null, retry: null }
    const html = renderToStaticMarkup(createElement(CartPage))
    const labels = tags(html, "button").map((b) => attr(b, "aria-label"))
    expect(labels).toEqual(
      expect.arrayContaining(["Decrease quantity of Shell Yeah", "Increase quantity of Shell Yeah", "Remove Shell Yeah"]),
    )
    const [img] = tags(html, "img")
    expect(attr(img, "alt")).toBe("")
  })
})
