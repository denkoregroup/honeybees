import { NextRequest } from "next/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { POST } from "../route"

const EMAIL = "private.person+newsletter@example.com"

function post(body: unknown) {
  return POST(
    new NextRequest("http://localhost/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  )
}

/** Spies on every console method so a log call of any level is caught. */
function spyOnConsole() {
  return (["log", "info", "warn", "error", "debug"] as const).map((method) =>
    vi.spyOn(console, method).mockImplementation(() => {})
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("POST /api/newsletter", () => {
  it("never logs the submitted address", async () => {
    const spies = spyOnConsole()
    await post({ email: EMAIL })

    const logged = JSON.stringify(spies.flatMap((spy) => spy.mock.calls))
    expect(logged).not.toContain(EMAIL)
    expect(logged).not.toContain("example.com")
  })

  it("does not log the address for an invalid submission either", async () => {
    const spies = spyOnConsole()
    await post({ email: "not-an-email" })
    expect(JSON.stringify(spies.flatMap((spy) => spy.mock.calls))).not.toContain("not-an-email")
  })

  it("says signups aren't live yet instead of reporting success", async () => {
    spyOnConsole()
    const response = await post({ email: EMAIL })
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body).not.toHaveProperty("success")
    expect(body.error).toMatch(/aren't live yet/i)
    expect(JSON.stringify(body)).not.toContain(EMAIL)
  })

  it.each([{}, { email: "" }, { email: "no-at-sign" }])("rejects %j with 400", async (payload) => {
    spyOnConsole()
    const response = await post(payload)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "Invalid email" })
  })
})
