import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import ContactPage from "../../app/contact/page"
import { ContactForm } from "../features/ContactForm"

// Business hours are Eastern time. Other US zone abbreviations (CST, PST...) must not creep back in.
const OTHER_ZONE = /\b(CST|CDT|PST|PDT|MST|MDT)\b/

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (name === "node_modules" || name === ".next" || name === "__tests__") return []
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(tsx?|md)$/.test(name) ? [path] : []
  })
}

describe("contact page hours", () => {
  it("are in EST", async () => {
    const html = renderToStaticMarkup(await Promise.resolve(createElement(ContactPage)))
    expect(html).toContain("Mon–Fri: 9am – 5pm EST")
  })

  it("never say CST (or another non-Eastern US zone) anywhere in app/ or components/", () => {
    const root = join(__dirname, "..", "..")
    const files = [...sourceFiles(join(root, "app")), ...sourceFiles(join(root, "components"))]
    const offenders = files.filter((file) => OTHER_ZONE.test(readFileSync(file, "utf8"))).map((file) => file.replace(root, ""))
    expect(offenders).toEqual([])
  })

  it("the pattern catches CST", () => {
    expect("Mon–Fri: 9am – 5pm CST").toMatch(OTHER_ZONE)
    expect("Mon–Fri: 9am – 5pm EST").not.toMatch(OTHER_ZONE)
  })
})

describe("contact form", () => {
  const html = renderToStaticMarkup(createElement(ContactForm))

  it("has no file attachment, since the file was never sent to /api/contact", () => {
    expect(html).not.toContain('type="file"')
    expect(html).not.toMatch(/attach a file/i)
  })

  it("keeps its other fields and the submit button", () => {
    for (const id of ["cf-name", "cf-email", "cf-subject", "cf-message"]) expect(html).toContain(`id="${id}"`)
    expect(html).toContain("SEND MESSAGE")
  })
})
