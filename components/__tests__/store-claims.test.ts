import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import ContactPage from "../../app/contact/page"

// Claims that must match what the store really does: it ships within the US only. (The footer's no-Reviews check is in components/layout/__tests__/footer.test.ts.)
describe("store claims", () => {
  it("the contact page says shipping is within the US, not worldwide", async () => {
    const html = renderToStaticMarkup(await Promise.resolve(createElement(ContactPage)))
    expect(html).toContain("Shipping within the US")
    expect(html).not.toMatch(/worldwide|international/i)
  })
})
