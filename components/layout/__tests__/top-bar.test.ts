import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AnnouncementStrip, ROTATE_MS, shouldRotate } from "../AnnouncementStrip"
import { MOBILE_ANNOUNCEMENTS, TopBar } from "../TopBar"

describe("mobile announcement messages", () => {
  it("are exactly these two", () => {
    expect(MOBILE_ANNOUNCEMENTS).toEqual([
      "Request a custom color on any apparel",
      "Custom made with love, just for you",
    ])
  })

  it("make no shipping, delivery, free, discount or customer-count claim", () => {
    for (const message of MOBILE_ANNOUNCEMENTS) {
      expect(message).not.toMatch(/ship|deliver|free|discount|sale|off\b|customers?|\d/i)
    }
  })
})

describe("AnnouncementStrip", () => {
  const html = renderToStaticMarkup(createElement(AnnouncementStrip, { messages: MOBILE_ANNOUNCEMENTS }))

  it("renders both messages, one paragraph each, the first visible", () => {
    expect(html.match(/<p /g)).toHaveLength(2)
    for (const message of MOBILE_ANNOUNCEMENTS) expect(html).toContain(message)
    expect(html).toMatch(/aria-hidden="false"[^>]*opacity:1[^>]*>Request a custom color on any apparel/)
    expect(html).toMatch(/aria-hidden="true"[^>]*opacity:0[^>]*>Custom made with love, just for you/)
  })

  it("is a 32px honey strip on mobile only, so desktop is untouched", () => {
    expect(html).toContain("h-8")
    expect(html).toContain("md:hidden")
    expect(html).toContain("var(--color-honey-yellow)")
  })

  it("uses 11px semibold uppercase Montserrat in ink", () => {
    expect(html).toContain("text-[11px]")
    expect(html).toContain("font-semibold")
    expect(html).toContain("uppercase")
    expect(html).toContain("var(--font-montserrat)")
    expect(html).toContain("var(--color-ink)")
  })

  it("is plain text: no link, and the messages only fade (no sliding)", () => {
    expect(html).not.toContain("<a ")
    expect(html).toContain("transition-opacity")
    expect(html).not.toMatch(/translate|slide/)
  })

  it("rotates every 5 seconds, but not with reduced motion or a single message", () => {
    expect(ROTATE_MS).toBe(5000)
    expect(shouldRotate(2, false)).toBe(true)
    expect(shouldRotate(2, true)).toBe(false)
    expect(shouldRotate(1, false)).toBe(false)
    expect(shouldRotate(0, false)).toBe(false)
  })
})

describe("TopBar", () => {
  const html = renderToStaticMarkup(createElement(TopBar))

  it("renders the mobile strip before the desktop bar", () => {
    expect(html.indexOf(MOBILE_ANNOUNCEMENTS[0])).toBeGreaterThan(-1)
    expect(html.indexOf(MOBILE_ANNOUNCEMENTS[0])).toBeLessThan(html.indexOf("Site announcements"))
  })

  it("leaves the desktop bar as it was: three items in a 36px bar", () => {
    expect(html).toContain("hidden md:contents")
    expect(html).toContain("height:36px")
    for (const item of ["Made with Love", "Packed with Care", "Shipped with Smiles"]) expect(html).toContain(item)
  })
})
