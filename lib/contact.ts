// Shared by the contact form (maxLength) and POST /api/contact (validation), so the two stay in step.
export const CONTACT_LIMITS = {
  name: 100,
  // RFC 5321 caps a forward path at 254 characters.
  email: 254,
  subject: 100,
  message: 5000,
} as const

// Name of the hidden honeypot input. People never see it; bots that fill every field do.
export const CONTACT_HONEYPOT_FIELD = "website"

export interface ValidContactSubmission {
  name: string
  email: string
  subject: string
  message: string
}

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// CR/LF would let a name break out of the email subject line it is placed in.
const LINE_BREAK = /[\r\n]/

function trimmed(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null
}

/** Returns the trimmed submission, or null if any field is missing, too long or malformed. */
export function validateContactSubmission(body: unknown): ValidContactSubmission | null {
  if (typeof body !== "object" || body === null) return null
  const input = body as Record<string, unknown>

  const name = trimmed(input.name)
  const email = trimmed(input.email)
  const message = trimmed(input.message)
  // Subject comes from a fixed select in the form; it is optional here so older clients still work.
  const subject = input.subject === undefined ? "" : trimmed(input.subject)

  if (!name || name.length > CONTACT_LIMITS.name || LINE_BREAK.test(name)) return null
  if (!email || email.length > CONTACT_LIMITS.email || !EMAIL_SHAPE.test(email)) return null
  if (!message || message.length > CONTACT_LIMITS.message) return null
  if (subject === null || subject.length > CONTACT_LIMITS.subject) return null

  return { name, email, subject, message }
}

/** True when the honeypot field holds anything, i.e. the submission came from a bot. */
export function isHoneypotFilled(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false
  const value = (body as Record<string, unknown>)[CONTACT_HONEYPOT_FIELD]
  return typeof value === "string" ? value.trim() !== "" : value !== undefined && value !== null
}
