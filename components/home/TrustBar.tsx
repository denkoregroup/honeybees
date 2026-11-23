const ITEMS = [
  {
    icon: "🤍",
    title: "MADE WITH LOVE",
    desc: "Every item is crafted with so much care!",
  },
  {
    icon: "📦",
    title: "PACKED WITH CARE",
    desc: "Your order is packed with extra love!",
  },
  {
    icon: "🚚",
    title: "SHIPPED WITH SMILES",
    desc: "Fast, reliable shipping straight to you!",
  },
]

export function TrustBar() {
  return (
    <section
      className="hidden border-y md:block"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        padding: "12px 0",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${ITEMS.length}, 1fr)`,
          }}
        >
          {ITEMS.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className="flex flex-col items-center text-center"
              style={{
                padding: "12px 8px",
                borderRight: i < ITEMS.length - 1 ? "1px solid var(--color-border)" : undefined,
              }}
            >
              <span
                style={{ fontSize: "20px", display: "block", marginBottom: "6px", lineHeight: 1 }}
              >
                {icon}
              </span>
              <p
                style={{
                  fontFamily: "var(--font-montserrat)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--color-black)",
                  marginBottom: "3px",
                }}
              >
                {title}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "10px",
                  color: "var(--color-gray)",
                  lineHeight: 1.4,
                  maxWidth: "130px",
                  margin: "0 auto",
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
