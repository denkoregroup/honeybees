"use client"

import { useState } from "react"

const SOCIAL = [
  {
    label: "Facebook",
    href: "https://facebook.com/honeybeedesigns",
    bg: "#1877F2",
    content: <span style={{ color: "white", fontWeight: 900, fontSize: "16px" }}>f</span>,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/honeybeedesigns",
    bg: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
    content: <span style={{ fontSize: "16px" }}>📷</span>,
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@honeybeedesigns",
    bg: "#000000",
    content: <span style={{ color: "white", fontSize: "18px" }}>♪</span>,
  },
  {
    label: "Pinterest",
    href: "https://pinterest.com/honeybeedesigns",
    bg: "#E60023",
    content: <span style={{ color: "white", fontWeight: 900, fontSize: "16px" }}>P</span>,
  },
  {
    label: "Email",
    href: "mailto:hello@honeybeedesigns.com",
    bg: "var(--color-primary)",
    content: <span style={{ color: "white", fontSize: "16px" }}>✉</span>,
  },
]

export function EmailSignup() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus("loading")
    setErrorMessage("")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setErrorMessage(data?.error ?? "")
        setStatus("error")
        return
      }
      setStatus("success")
      setEmail("")
    } catch {
      setStatus("error")
    }
  }

  return (
    <>
    {/* Mobile (below md): no band, straight on cream */}
    <section className="px-4 pb-8 md:hidden">
      <h2 className="text-center text-[28px] leading-10" style={{ fontFamily: "var(--font-pacifico)", color: "var(--color-ink)" }}>
        Join the hive!
      </h2>
      <p className="mt-2 text-center text-[16px] leading-6" style={{ fontFamily: "var(--font-inter)", color: "var(--color-ink)" }}>
        Be the first to know about new arrivals, sales &amp; more!
      </p>

      {status === "success" ? (
        <p role="status" className="mt-4 text-center text-[16px] font-bold" style={{ fontFamily: "var(--font-montserrat)", color: "var(--color-ink)" }}>
          You&apos;re in! Welcome to the hive 🐝
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label htmlFor="signup-email-mobile" className="sr-only">
            Email address
          </label>
          <input
            id="signup-email-mobile"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            className="focus-ring h-11 w-full rounded-md border px-4 text-[16px] placeholder:text-[var(--color-gray)]"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-ink)", fontFamily: "var(--font-inter)" }}
          />
          <button type="submit" disabled={status === "loading"} className="btn-primary focus-ring w-full disabled:opacity-60">
            {status === "loading" ? "Joining…" : "Join now"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p role="alert" className="mt-3 text-center text-[14px]" style={{ fontFamily: "var(--font-inter)", color: "var(--color-coral-ink)" }}>
          Something went wrong. Please try again!
        </p>
      )}
    </section>

    <section
      className="hidden md:block"
      style={{
        backgroundColor: "white",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "160px 1fr auto",
          gap: "24px",
          alignItems: "center",
        }}
        className="signup-grid"
      >
        {/* Col 1 — Bee illustration */}
        <div
          className="hidden md:flex items-center justify-center"
        >
          {/* TODO: real bee + flower illustration from Sarah */}
          <div style={{ width: "120px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>
            🐝🌸
          </div>
        </div>

        {/* Col 2 — Heading + form */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px" }}>
          <h2 style={{ fontFamily: "var(--font-pacifico)", fontSize: "20px", color: "var(--color-black)", margin: 0 }}>
            🐝 JOIN THE HIVE!
          </h2>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "var(--color-gray)", margin: 0 }}>
            Be the first to know about new arrivals, sales &amp; more! 🌻
          </p>

          {status === "success" ? (
            <p
              style={{
                backgroundColor: "var(--color-primary)",
                borderRadius: "9999px",
                padding: "10px 16px",
                fontFamily: "var(--font-montserrat)",
                fontSize: "13px",
                fontWeight: 700,
                color: "white",
                margin: 0,
              }}
            >
              You&apos;re in! Welcome to the hive 🐝
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "row", gap: "8px", alignItems: "center" }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                style={{
                  flex: 1,
                  maxWidth: "280px",
                  height: "38px",
                  borderRadius: "9999px",
                  border: "1px solid var(--color-border)",
                  padding: "0 16px",
                  fontFamily: "var(--font-inter)",
                  fontSize: "13px",
                  outline: "none",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)" }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)" }}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  height: "38px",
                  padding: "0 20px",
                  borderRadius: "9999px",
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  fontFamily: "var(--font-montserrat)",
                  fontSize: "13px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-primary-dark)" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-primary)" }}
              >
                {status === "loading" ? "Joining…" : "JOIN NOW"}
              </button>
            </form>
          )}

          {status === "error" && (
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "#ef4444", margin: 0 }}>
              {errorMessage || "Something went wrong. Please try again!"}
            </p>
          )}
        </div>

        {/* Col 3 — Follow Us */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "10px",
            borderLeft: "1px solid var(--color-border)",
            paddingLeft: "24px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--color-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: 0,
            }}
          >
            FOLLOW US
          </p>
          <div style={{ display: "flex", flexDirection: "row", gap: "8px", alignItems: "center" }}>
            {SOCIAL.map(({ label, href, bg, content }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "opacity 0.2s, transform 0.2s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.opacity = "0.85"
                  el.style.transform = "scale(1.05)"
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.opacity = "1"
                  el.style.transform = "scale(1)"
                }}
              >
                {content}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .signup-grid {
            grid-template-columns: 120px 1fr auto !important;
            gap: 16px !important;
          }
        }
        @media (max-width: 768px) {
          .signup-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            text-align: center;
          }
        }
      `}</style>
    </section>
    </>
  )
}
