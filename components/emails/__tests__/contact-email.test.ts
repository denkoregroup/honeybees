import { describe, expect, it } from "vitest"
import { render } from "react-email"
import { ContactEmail } from "@/components/emails/ContactEmail"

// The contact route hands this element to Resend, which renders it with @react-email/render.
const html = (data: Parameters<typeof ContactEmail>[0]["data"]) => render(ContactEmail({ data }))

describe("ContactEmail", () => {
  it("includes the sender and their message", async () => {
    const out = await html({ name: "Jane Doe", email: "jane@example.com", message: "Can I get a tumbler?" })
    expect(out).toContain("Jane Doe")
    expect(out).toContain("jane@example.com")
    expect(out).toContain("Can I get a tumbler?")
    expect(out).not.toContain("CUSTOM REQUEST")
  })

  it("escapes HTML the sender types", async () => {
    const out = await html({
      name: "<b>Eve</b>",
      email: "eve@example.com",
      message: "<script>alert(1)</script>",
      customRequest: "<img src=x>",
    })
    expect(out).not.toContain("<script>")
    expect(out).not.toContain("<b>Eve")
    expect(out).not.toContain("<img src=x>")
    expect(out).toContain("&lt;script&gt;alert(1)&lt;/script&gt;")
    expect(out).toContain("&lt;b&gt;Eve&lt;/b&gt;")
    expect(out).toContain("&lt;img src=x&gt;")
  })
})
