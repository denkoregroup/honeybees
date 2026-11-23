import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { LineAttributes } from "../LineAttributes"

const render = (attributes: { key: string; value: string }[]) =>
  renderToStaticMarkup(createElement(LineAttributes, { attributes }))

describe("LineAttributes", () => {
  it("shows the requested color on the line", () => {
    expect(render([{ key: "Requested color", value: "Forest green" }])).toContain("Requested color: Forest green")
  })

  it("renders nothing when the line has no attributes", () => {
    expect(render([])).toBe("")
  })

  it("hides underscore-prefixed (hidden) attributes", () => {
    expect(render([{ key: "_internal", value: "x" }])).toBe("")
  })

  it("escapes what the customer typed instead of rendering it as HTML", () => {
    const html = render([{ key: "Requested color", value: "<img src=x onerror=alert(1)><script>alert(2)</script>" }])
    expect(html).not.toContain("<img")
    expect(html).not.toContain("<script")
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;")
  })
})
