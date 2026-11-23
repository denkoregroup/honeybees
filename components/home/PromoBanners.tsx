import Link from "next/link"

export function PromoBanners() {
  return (
    <>
    {/* Mobile (below md): only the custom order card */}
    <section className="px-4 pb-8 md:hidden">
      <div
        className="flex flex-col rounded-xl border p-6"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <p className="text-[15px] font-bold uppercase" style={{ fontFamily: "var(--font-montserrat)", color: "var(--color-ink)" }}>
          🐝 NEED SOMETHING
        </p>
        <p
          className="text-[32px] font-black uppercase leading-none"
          style={{ fontFamily: "var(--font-montserrat)", color: "var(--color-coral-display)" }}
        >
          CUSTOM?
        </p>
        <p className="mt-1 text-[13px] font-semibold" style={{ fontFamily: "var(--font-montserrat)", color: "var(--color-ink)" }}>
          WE&apos;VE GOT YOU!
        </p>
        <Link href="/contact" className="btn-secondary focus-ring mt-6 w-full">
          Custom order →
        </Link>
      </div>
    </section>

    <section className="hidden md:block" style={{ backgroundColor: "var(--color-cream)", padding: "24px 0" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          padding: "0 24px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Panel 1 — Black / Custom Order */}
        <div
          className="flex flex-col justify-center relative overflow-hidden"
          style={{
            backgroundColor: "#1A1A1A",
            minHeight: "220px",
            padding: "28px 24px",
            borderRadius: "16px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "15px",
              fontWeight: 700,
              color: "white",
              textTransform: "uppercase",
              marginBottom: "2px",
            }}
          >
            🐝 NEED SOMETHING
          </p>
          <p
            style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "32px",
              fontWeight: 900,
              color: "var(--color-primary)",
              textTransform: "uppercase",
              lineHeight: 1,
              marginBottom: "4px",
            }}
          >
            CUSTOM?
          </p>
          <p
            style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "13px",
              fontWeight: 600,
              color: "white",
              marginBottom: "20px",
            }}
          >
            WE&apos;VE GOT YOU!
          </p>
          <Link
            href="/contact"
            className="transition-colors hover:bg-[var(--color-primary-dark)]"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "var(--color-primary)",
              color: "white",
              fontFamily: "var(--font-montserrat)",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "9px 20px",
              borderRadius: "9999px",
              textDecoration: "none",
              alignSelf: "flex-start",
            }}
          >
            CUSTOM ORDER →
          </Link>
          {/* TODO: bee mascot illustration — position absolute, right 0, bottom 0, height 90% */}
        </div>

        {/* Panel 2 — Warm pink / Be Kind */}
        <div
          className="flex flex-col items-center justify-center text-center overflow-hidden"
          style={{
            backgroundColor: "#FFF0E8",
            minHeight: "220px",
            padding: "28px 24px",
            gap: "4px",
            borderRadius: "16px",
          }}
        >
          <p style={{ fontFamily: "var(--font-montserrat)", fontSize: "30px", fontWeight: 900, color: "var(--color-primary)", lineHeight: 1.1 }}>
            🌸 BE KIND
          </p>
          <p style={{ fontFamily: "var(--font-montserrat)", fontSize: "30px", fontWeight: 900, color: "var(--color-black)", lineHeight: 1.1 }}>
            🌻 BE HAPPY
          </p>
          <p style={{ fontFamily: "var(--font-montserrat)", fontSize: "30px", fontWeight: 900, color: "var(--color-primary)", lineHeight: 1.1 }}>
            🐝 BE YOU
          </p>
          {/* TODO: floral/bee decoration bottom right */}
        </div>

        {/* Panel 3 — White / Thank You */}
        <div
          className="flex flex-col items-center justify-center text-center overflow-hidden"
          style={{
            backgroundColor: "white",
            border: "1px solid var(--color-border)",
            minHeight: "220px",
            padding: "28px 24px",
            borderRadius: "16px",
          }}
        >
          <p style={{ fontFamily: "var(--font-pacifico)", fontSize: "28px", color: "var(--color-primary)", marginBottom: "8px" }}>
            💛 THANK YOU!
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "var(--color-black)", marginBottom: "2px" }}>
            for supporting my
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", fontWeight: 600, color: "var(--color-black)", marginBottom: "16px" }}>
            small business!
          </p>
          {/* TODO: replace with bee + heart illustration */}
          <span style={{ fontSize: "32px", lineHeight: 1 }}>🌻</span>
        </div>
      </div>
    </section>
    </>
  )
}
