import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { CheckoutButton } from "../CheckoutButton"

describe("CheckoutButton", () => {
  it("is a link to the checkout URL with the primary button treatment", () => {
    const html = renderToStaticMarkup(createElement(CheckoutButton, { href: "https://shop.example/checkout/abc" }))
    expect(html).toContain('href="https://shop.example/checkout/abc"')
    expect(html).toContain("btn-cta")
    expect(html).toContain("w-full")
    expect(html).toContain('aria-disabled="false"')
    expect(html).toContain("Checkout")
  })

  it("is disabled while the cart is changing", () => {
    const html = renderToStaticMarkup(createElement(CheckoutButton, { href: "https://shop.example/c", disabled: true }))
    expect(html).toContain('aria-disabled="true"')
  })
})
