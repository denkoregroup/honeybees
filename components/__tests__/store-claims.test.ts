import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import ContactPage from "../../app/contact/page"
import { Footer } from "../layout/Footer"

// Claims that must match what the store really does: it ships within the US only, and there is no reviews page.
describe("store claims", () => {
  it("the contact page says shipping is within the US, not worldwide", async () => {
    const html = renderToStaticMarkup(await Promise.resolve(createElement(ContactPage)))
    expect(html).toContain("Shipping within the US")
    expect(html).not.toMatch(/worldwide|international/i)
  })

  it("the footer has no Reviews link, and keeps the rest of the About column", () => {
    const html = renderToStaticMarkup(createElement(Footer))
    expect(html).not.toMatch(/>Reviews</)
    for (const label of ["Our Story", "Wholesale", "Custom Orders"]) expect(html).toContain(label)
  })
})
