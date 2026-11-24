"use client"

const STEPS = [
  {
    number: 1,
    emoji: "🛒",
    label: "CHOOSE YOUR PRODUCT & ADD TO CART",
  },
  {
    number: 2,
    emoji: "☁️",
    label: "UPLOAD YOUR IMAGE OR DESIGN AT CHECKOUT",
  },
  {
    number: 3,
    emoji: "🚚",
    label: "WE PRINT, PACK & SHIP YOUR ORDER WITH LOVE!",
  },
]

export function HowItWorks() {
  return (
    <>
    {/* Mobile (below md): stacked steps, no arrows */}
    <section className="px-4 pb-8 md:hidden">
      <h2
        className="mb-6 text-center text-[28px] font-extrabold leading-9"
        style={{ fontFamily: "var(--font-montserrat)", color: "var(--color-ink)" }}
      >
        Custom is easy as{" "}
        <span style={{ color: "var(--color-coral-display)" }}>1-2-3!</span>
      </h2>
      <ol className="flex flex-col gap-6">
        {STEPS.map(({ number, label }) => (
          <li key={number} className="flex items-center gap-4">
            <span
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-[24px] font-black"
              style={{ backgroundColor: "var(--color-coral-display)", color: "white", fontFamily: "var(--font-montserrat)" }}
              aria-hidden
            >
              {number}
            </span>
            <span
              className="text-[14px] font-bold uppercase leading-5 tracking-[0.04em]"
              style={{ fontFamily: "var(--font-montserrat)", color: "var(--color-ink)" }}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>
    </section>

    <section className="hidden md:block" style={{ backgroundColor: "var(--color-surface)", padding: "64px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>
        {/* Heading */}
        <h2
          className="text-center font-bold"
          style={{
            fontSize: "24px",
            color: "var(--color-black)",
            marginBottom: "48px",
            fontFamily: "var(--font-montserrat)",
          }}
        >
          <span aria-hidden>🤍 </span>CUSTOM IS EASY AS 1-2-3!<span aria-hidden> 🤍</span>
        </h2>

        {/* Steps row */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center">
          {STEPS.map(({ number, emoji, label }, i) => (
            <div key={number} className="flex flex-col md:flex-row items-center">
              {/* Step */}
              <div
                className="flex flex-col items-center text-center"
                style={{ width: "200px" }}
              >
                {/* Number circle — honey yellow */}
                <div
                  className="flex items-center justify-center font-black"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-honey-yellow)",
                    color: "var(--color-black)",
                    fontSize: "20px",
                    marginBottom: "12px",
                  }}
                >
                  {number}
                </div>

                {/* Emoji icon */}
                <span
                  style={{
                    fontSize: "32px",
                    marginBottom: "32px",
                    lineHeight: 1,
                  }}
                >
                  {emoji}
                </span>

                {/* Label */}
                <p
                  className="font-bold uppercase"
                  style={{
                    fontSize: "12px",
                    color: "var(--color-black)",
                    letterSpacing: "0.04em",
                    lineHeight: 1.4,
                    maxWidth: "160px",
                    fontFamily: "var(--font-montserrat)",
                  }}
                >
                  {label}
                </p>
              </div>

              {/* Desktop arrow */}
              {i < STEPS.length - 1 && (
                <span
                  className="hidden md:block"
                  style={{
                    fontSize: "28px",
                    color: "var(--color-primary)",
                    alignSelf: "flex-start",
                    marginTop: "56px",
                    padding: "0 16px",
                    lineHeight: 1,
                  }}
                  aria-hidden
                >
                  →
                </span>
              )}

              {/* Mobile arrow */}
              {i < STEPS.length - 1 && (
                <span
                  className="block md:hidden"
                  style={{
                    fontSize: "28px",
                    color: "var(--color-primary)",
                    margin: "8px 0",
                    lineHeight: 1,
                  }}
                  aria-hidden
                >
                  ↓
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  )
}
