const ITEMS = [
  { icon: "🤍", text: "Made with Love" },
  { icon: "📦", text: "Packed with Care" },
  { icon: "🚚", text: "Shipped with Smiles" },
]

export function TopBar() {
  return (
    <>
      <div className="hidden md:contents">
        <div
      className="border-b overflow-hidden"
      style={{
        backgroundColor: "var(--color-topbar-bg)",
        borderColor: "var(--color-border)",
        height: "36px",
      }}
      aria-label="Site announcements"
    >
      {/* Desktop: static row, every item visible */}
      <div className="hidden h-full lg:flex items-center justify-center">
        {ITEMS.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-6 text-[12px] font-medium"
            style={{
              color: "var(--color-topbar-text)",
              borderRight: i < ITEMS.length - 1 ? "1px solid var(--color-border)" : undefined,
            }}
          >
            <span>{item.icon}</span>
            {item.text}
          </span>
        ))}
      </div>

      {/* Mobile: infinite marquee */}
      <div className="lg:hidden h-full flex items-center overflow-hidden">
        <div className="marquee-track whitespace-nowrap">
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-5 text-[12px] font-medium"
              style={{ color: "var(--color-topbar-text)" }}
            >
              <span>{item.icon}</span>
              {item.text}
              <span className="ml-3 opacity-30" aria-hidden>|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
      </div>
    </>
  )
}
