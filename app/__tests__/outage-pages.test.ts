import { createElement, isValidElement, type ReactElement, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

// Neither page may need Shopify: they're what visitors see when it's down.
vi.mock("@/lib/storefront", () => {
  throw new Error("the outage pages must not import lib/storefront")
})

// What Next passes in production for a Server Component failure: a generic message and a digest.
const error = Object.assign(new Error("Shopify getProducts failed: 503 Service Unavailable"), { digest: "123456" })

/** The first element of the given type in a rendered tree (the error pages are plain functions without hooks). */
function find(node: ReactNode, type: string): ReactElement<{ onClick?: () => void; children?: ReactNode }> | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = find(child, type)
      if (found) return found
    }
    return undefined
  }
  if (!isValidElement<{ children?: ReactNode }>(node)) return undefined
  if (node.type === type) return node as ReactElement<{ onClick?: () => void }>
  return find(node.props.children, type)
}

describe("page error (app/error.tsx)", () => {
  it("tells the visitor the shop will be back, without technical detail", async () => {
    const { default: ErrorPage } = await import("../error")
    const html = renderToStaticMarkup(createElement(ErrorPage, { error, unstable_retry: () => {} }))
    expect(html).toContain("We&#x27;ll be back soon")
    expect(html).toContain("Our shop isn&#x27;t loading right now.")
    expect(html).not.toContain("Shopify")
    expect(html).not.toContain("503")
    expect(html).not.toContain(error.digest)
  })

  it("offers the contact page", async () => {
    const { default: ErrorPage } = await import("../error")
    const html = renderToStaticMarkup(createElement(ErrorPage, { error, unstable_retry: () => {} }))
    expect(html).toMatch(/<a [^>]*href="\/contact"[^>]*>Get in touch<\/a>/)
  })

  it("retries the page from its Try again button", async () => {
    const { default: ErrorPage } = await import("../error")
    const unstable_retry = vi.fn()
    const button = find(ErrorPage({ error, unstable_retry }), "button")
    expect(button?.props.children).toBe("Try again")
    button?.props.onClick?.()
    expect(unstable_retry).toHaveBeenCalledOnce()
  })
})

describe("root layout error (app/global-error.tsx)", () => {
  it("renders a whole document, since it replaces the root layout", async () => {
    const { default: GlobalError } = await import("../global-error")
    const html = renderToStaticMarkup(createElement(GlobalError, { error, unstable_retry: () => {} }))
    expect(html).toMatch(/^<html lang="en"[^>]*>[\s\S]*<body[^>]*>[\s\S]*<\/body><\/html>$/)
    expect(html).toContain("<title>We&#x27;ll be back soon | HoneyBee Designs</title>")
    expect(html).toContain("HoneyBee Designs will be back soon")
    expect(html).not.toContain("Shopify")
    expect(html).not.toContain(error.digest)
  })

  it("has no links into the site, which shares the failing layout", async () => {
    const { default: GlobalError } = await import("../global-error")
    const html = renderToStaticMarkup(createElement(GlobalError, { error, unstable_retry: () => {} }))
    expect(html).not.toContain("<a ")
  })

  it("retries from its Try again button", async () => {
    const { default: GlobalError } = await import("../global-error")
    const unstable_retry = vi.fn()
    const button = find(GlobalError({ error, unstable_retry }), "button")
    expect(button?.props.children).toBe("Try again")
    button?.props.onClick?.()
    expect(unstable_retry).toHaveBeenCalledOnce()
  })
})
