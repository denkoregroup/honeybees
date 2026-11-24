import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CONTACT_HONEYPOT_FIELD, CONTACT_LIMITS } from "@/lib/contact"
import { POST } from "../route"

const send = vi.hoisted(() => vi.fn())

vi.mock("resend", () => ({
  Resend: class {
    emails = { send }
  },
}))

// Pass the template's props through so a test can see exactly what data reaches the email.
vi.mock("@/components/emails/ContactEmail", () => ({
  ContactEmail: (props: unknown) => props,
}))

const NAME = "Private Person"
const EMAIL = "private.person+contact@example.com"
const MESSAGE = "A private message body that must never reach the logs."

const VALID = {
  name: NAME,
  email: EMAIL,
  subject: "General Question",
  message: MESSAGE,
}

function post(body: string) {
  return POST(
    new NextRequest("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    })
  )
}

const postJson = (body: unknown) => post(JSON.stringify(body))

/** Spies on every console method so a log call of any level is caught. */
function spyOnConsole() {
  return (["log", "info", "warn", "error", "debug"] as const).map((method) =>
    vi.spyOn(console, method).mockImplementation(() => {})
  )
}

const logged = (spies: ReturnType<typeof spyOnConsole>) =>
  JSON.stringify(spies.flatMap((spy) => spy.mock.calls))

beforeEach(() => {
  vi.stubEnv("RESEND_API_KEY", "test-key")
  send.mockReset()
  send.mockResolvedValue({ data: { id: "email-id" }, error: null })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("POST /api/contact", () => {
  it("sends a valid submission with trimmed fields", async () => {
    const response = await postJson({
      ...VALID,
      name: `  ${NAME}  `,
      email: ` ${EMAIL} `,
      message: `\n${MESSAGE}\n`,
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })
    expect(send).toHaveBeenCalledTimes(1)
    const options = send.mock.calls[0][0]
    expect(options.replyTo).toBe(EMAIL)
    expect(options.subject).toBe(`New Contact Message from ${NAME}`)
    expect(options.react.data).toEqual({ name: NAME, email: EMAIL, message: MESSAGE })
  })

  it("accepts fields exactly at the length limits", async () => {
    const response = await postJson({
      ...VALID,
      name: "n".repeat(CONTACT_LIMITS.name),
      message: "m".repeat(CONTACT_LIMITS.message),
      subject: "s".repeat(CONTACT_LIMITS.subject),
    })
    expect(response.status).toBe(200)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it("accepts a submission without a subject", async () => {
    const response = await postJson({ name: NAME, email: EMAIL, message: MESSAGE })
    expect(response.status).toBe(200)
  })

  it.each([
    ["missing name", { ...VALID, name: undefined }],
    ["missing email", { ...VALID, email: undefined }],
    ["missing message", { ...VALID, message: undefined }],
    ["whitespace-only name", { ...VALID, name: "   " }],
    ["whitespace-only message", { ...VALID, message: " \n\t " }],
    ["non-string name", { ...VALID, name: 42 }],
    ["non-string subject", { ...VALID, subject: ["General Question"] }],
    ["name too long", { ...VALID, name: "n".repeat(CONTACT_LIMITS.name + 1) }],
    ["subject too long", { ...VALID, subject: "s".repeat(CONTACT_LIMITS.subject + 1) }],
    ["message too long", { ...VALID, message: "m".repeat(CONTACT_LIMITS.message + 1) }],
    [
      "email too long",
      { ...VALID, email: `${"a".repeat(CONTACT_LIMITS.email)}@example.com` },
    ],
    ["email without @", { ...VALID, email: "not-an-email" }],
    ["email without domain dot", { ...VALID, email: "person@localhost" }],
    ["email with spaces", { ...VALID, email: "pri vate@example.com" }],
    ["name with a line break", { ...VALID, name: "Name\r\nBcc: other@example.com" }],
  ])("rejects %s with 400 and does not send", async (_label, payload) => {
    const response = await postJson(payload)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "Invalid submission" })
    expect(send).not.toHaveBeenCalled()
  })

  it.each([
    ["malformed JSON", "{not json"],
    ["an empty body", ""],
    ["a JSON string", JSON.stringify("hello")],
    ["JSON null", "null"],
    ["a JSON array", JSON.stringify([VALID])],
  ])("rejects %s with 400 instead of a 500", async (_label, body) => {
    const response = await post(body)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "Invalid submission" })
    expect(send).not.toHaveBeenCalled()
  })

  it("returns the normal success response without sending when the honeypot is filled", async () => {
    const response = await postJson({ ...VALID, [CONTACT_HONEYPOT_FIELD]: "https://spam.test" })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })
    expect(send).not.toHaveBeenCalled()
  })

  it("gives a bot that fills the honeypot success even when other fields are invalid", async () => {
    const response = await postJson({ [CONTACT_HONEYPOT_FIELD]: "x", email: "junk" })
    expect(response.status).toBe(200)
    expect(send).not.toHaveBeenCalled()
  })

  it("treats an empty honeypot as a real submission", async () => {
    const response = await postJson({ ...VALID, [CONTACT_HONEYPOT_FIELD]: "" })
    expect(response.status).toBe(200)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it("logs only the error code and status when sending fails, never the name, address or message", async () => {
    send.mockResolvedValue({
      data: null,
      error: {
        name: "validation_error",
        statusCode: 422,
        message: `Invalid reply_to: ${EMAIL} from ${NAME}`,
      },
    })
    const spies = spyOnConsole()

    const response = await postJson(VALID)

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: "Failed to send email" })
    const output = logged(spies)
    expect(output).toContain("validation_error")
    expect(output).toContain("422")
    expect(output).not.toContain(EMAIL)
    expect(output).not.toContain("example.com")
    expect(output).not.toContain(NAME)
    expect(output).not.toContain(MESSAGE)
  })

  it("logs nothing for a rejected submission", async () => {
    const spies = spyOnConsole()
    await postJson({ ...VALID, email: "not-an-email" })
    expect(spies.every((spy) => spy.mock.calls.length === 0)).toBe(true)
  })

  it("returns 503 without sending when Resend is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "")
    const response = await postJson(VALID)
    expect(response.status).toBe(503)
    expect(send).not.toHaveBeenCalled()
  })
})
