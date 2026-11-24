import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { ContactEmail } from "@/components/emails/ContactEmail"
import { isHoneypotFilled, validateContactSubmission } from "@/lib/contact"

const INVALID = { error: "Invalid submission" }

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(INVALID, { status: 400 })
  }

  // Bots get the same answer as people, so the honeypot gives them nothing to tune against.
  if (isHoneypotFilled(body)) {
    return NextResponse.json({ success: true })
  }

  const submission = validateContactSubmission(body)
  if (!submission) {
    return NextResponse.json(INVALID, { status: 400 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 503 }
    )
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const to = process.env.CONTACT_EMAIL ?? "hello@honeybeedesigns.com"
  const { name, email, message } = submission

  const { error } = await resend.emails.send({
    from: "HoneyBee Designs <noreply@honeybeedesigns.com>",
    to,
    subject: `New Contact Message from ${name}`,
    react: ContactEmail({ data: { name, email, message } }),
    replyTo: email,
  })

  if (error) {
    // Only the code and status: Resend's message text can echo addresses back.
    console.error("Contact email failed:", error.name, error.statusCode)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
