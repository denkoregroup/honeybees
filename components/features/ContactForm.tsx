"use client"

import { useState } from "react"
import { CONTACT_HONEYPOT_FIELD, CONTACT_LIMITS } from "@/lib/contact"

const SUBJECTS = [
  "General Question",
  "Custom Order Request",
  "Order Status / Tracking",
  "Returns & Exchanges",
  "Wholesale / Bulk Pricing",
]

interface FormState {
  name: string
  email: string
  subject: string
  message: string
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: SUBJECTS[0],
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const honeypot = new FormData(e.currentTarget).get(CONTACT_HONEYPOT_FIELD)
    setStatus("loading")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          [CONTACT_HONEYPOT_FIELD]: honeypot,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus("success")
      setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" })
    } catch {
      setStatus("error")
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/20"
  const labelClass = "mb-1 block text-[12px] font-bold uppercase tracking-wide text-[var(--color-ink)]"

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="text-5xl">🐝</span>
        <p className="text-[18px] font-black text-[var(--color-ink)]">Message sent!</p>
        <p className="text-[14px] text-[var(--color-secondary)]">
          We&apos;ll get back to you within 1 business day.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-2 text-[13px] text-[var(--color-coral)] underline underline-offset-2"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot: off-screen and hidden from assistive tech; only bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <input type="text" name={CONTACT_HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className={labelClass}>Name</label>
          <input
            id="cf-name"
            required
            maxLength={CONTACT_LIMITS.name}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Smith"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="cf-email" className={labelClass}>Email</label>
          <input
            id="cf-email"
            type="email"
            required
            maxLength={CONTACT_LIMITS.email}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jane@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="cf-subject" className={labelClass}>Subject</label>
        <select
          id="cf-subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className={inputClass}
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cf-message" className={labelClass}>Message</label>
        <textarea
          id="cf-message"
          required
          rows={5}
          maxLength={CONTACT_LIMITS.message}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us how we can help..."
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-[var(--color-coral)] py-3.5 text-[14px] font-bold text-white transition-all hover:bg-[var(--color-coral-dark)] disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
      >
        {status === "loading" ? "Sending…" : "SEND MESSAGE ♥"}
      </button>

      {status === "error" && (
        <p className="text-[12px] text-red-500">
          Something went wrong. Please try again or email us directly.
        </p>
      )}
    </form>
  )
}
