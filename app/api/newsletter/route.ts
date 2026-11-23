import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { email } = (await req.json()) as { email?: string }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  // Nothing stores subscribers yet (#13), so say so instead of reporting success. Never log the address.
  return NextResponse.json(
    { error: "Newsletter signups aren't live yet. Please check back soon!" },
    { status: 503 }
  )
}
