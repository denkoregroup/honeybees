import { createElement, type ComponentProps, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import FaqPage, { metadata } from "../faq/page"

// The accordion only renders an answer while it is open. To check every answer, `open.all` swaps it for one
// that renders all of them; otherwise the real accordion renders.
const open = vi.hoisted(() => ({ all: false }))
vi.mock("@/components/ui/accordion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/ui/accordion")>()
  const { createElement: h, Fragment } = await import("react")
  return {
    Accordion: (props: ComponentProps<typeof actual.Accordion>) =>
      open.all
        ? h(Fragment, null, ...props.items.map((item) => h("div", { key: item.title }, h("h3", null, item.title), item.content as ReactNode)))
        : h(actual.Accordion, props),
  }
})

function render(allOpen = false) {
  open.all = allOpen
  return renderToStaticMarkup(createElement(FaqPage))
}

const tags = (html: string, name: string) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map(([tag]) => tag)
const attr = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1]
const text = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&#x27;|&apos;/g, "'").replace(/&amp;/g, "&")

const QUESTIONS = [
  "How long is turnaround time?",
  "When will my order ship?",
  "Do you offer custom orders?",
  "What printing methods do you use?",
  "What apparel brands do you use?",
  "Can I use my own logo or design?",
  "Where can I contact you?",
]

describe("FAQ page", () => {
  it("has one h1 and an h2 for each section", () => {
    const html = render()
    expect(tags(html, "h1")).toHaveLength(1)
    const h2s = [...html.matchAll(/<h2\b[^>]*>(.*?)<\/h2>/g)].map(([, inner]) => text(inner).trim())
    expect(h2s).toEqual(["Frequently Asked Questions", "Care Instructions", "Sublimation vs DTF"])
  })

  it("shows each of Sarah's questions as a collapsed accordion button that can be focused", () => {
    const html = render()
    const buttons = [...html.matchAll(/(<button\b[^>]*>)(.*?)<\/button>/g)]
    expect(buttons.map(([, , inner]) => text(inner))).toEqual(QUESTIONS)
    for (const [, tag] of buttons) {
      expect(attr(tag, "aria-expanded")).toBe("false")
      expect(attr(tag, "aria-controls")).toBeTruthy()
      expect(attr(tag, "class")?.split(" ")).toContain("focus-ring")
    }
  })

  it("keeps the conditions Sarah attached to the turnaround time", () => {
    const page = text(render(true))
    expect(page).toContain("approximately 3–4 business days unless otherwise stated")
    expect(page).toContain("Larger custom or bulk orders may take slightly longer depending on the size and details of the order.")
    expect(page).toContain("Orders are shipped after production is complete.")
  })

  it("answers every question with Sarah's details", () => {
    const page = text(render(true))
    for (const method of ["Sublimation printing", "DTF (Direct To Film)", "UV DTF", "Custom vinyl & decals"]) expect(page).toContain(method)
    for (const brand of ["Comfort Colors", "Gildan", "Bella Canvas", "Next Level", "Jerzees"]) expect(page).toContain(brand)
    expect(page).toContain("depending on product availability and style")
    expect(page).toContain("upload your own design, inspiration photo, logo or idea")
    expect(page).toContain("clear and high quality")
  })

  it("links the contact form to /contact and the social accounts already used on the home page", () => {
    const links = tags(render(true), "a")
    const hrefs = links.map((a) => attr(a, "href"))
    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/contact",
        "https://facebook.com/honeybeedesigns",
        "https://instagram.com/honeybeedesigns",
        "https://tiktok.com/@honeybeedesigns",
      ]),
    )
    for (const a of links) expect(attr(a, "class")?.split(" ")).toContain("focus-ring")
  })

  it("has the apparel and drinkware care instructions", () => {
    const page = text(render())
    for (const step of ["Wash inside out", "Machine wash cold", "Do not bleach", "Tumble dry low or hang dry", "Do not dry clean"]) {
      expect(page).toContain(step)
    }
    for (const step of ["Hand wash only", "Do not microwave", "Avoid extreme heat", "Do not soak"]) expect(page).toContain(step)
  })

  it("explains sublimation, DTF and the difference", () => {
    const page = text(render())
    expect(page).toContain("What is sublimation printing?")
    expect(page).toContain("What is DTF printing?")
    expect(page).toContain("What's the difference?")
    expect(page).toContain("Ink becomes part of the material")
    expect(page).toContain("Transfer pressed onto fabric")
  })

  it("points to the store policies instead of stating return terms or linking policy pages itself", () => {
    const html = render(true)
    expect(text(html)).toContain("store policies, linked at the bottom of every page")
    expect(html).not.toMatch(/policies\/|myshopify|checkout\.shopify/)
    expect(text(html)).not.toMatch(/within \d+ days|no returns|refunds? (are|is) /i)
  })
})

describe("FAQ page metadata", () => {
  it("has the short title FAQ and a description from Sarah's copy", () => {
    expect(metadata.title).toBe("FAQ")
    expect(metadata.description).toMatch(/turnaround/i)
    expect(metadata.description).toMatch(/care instructions/i)
  })
})
