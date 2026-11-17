import Link from "next/link"

const SHOP_LINKS = [
  { label: "All Products", href: "/shop" },
  { label: "Collections",  href: "/collections" },
]

const HELP_LINKS = [
  { label: "FAQ",               href: "#" },
  { label: "Shipping & Returns",href: "#" },
  { label: "Order Tracking",    href: "#" },
  { label: "Care Instructions", href: "#" },
  { label: "Size Charts",       href: "#" },
  { label: "Contact Us",        href: "/contact" },
  { label: "Terms of Service",  href: "#" },
]

const ABOUT_LINKS = [
  { label: "Our Story",         href: "/about" },
  { label: "Reviews",           href: "#" },
  { label: "Wholesale",         href: "#" },
  { label: "Custom Orders",     href: "/contact" },
]

const PAYMENT_METHODS = ["VISA", "MC", "AMEX", "DISCOVER", "APPLE PAY", "G PAY", "PAYPAL", "SHOPIFY"]

const columnHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-montserrat)",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--color-black)",
  marginBottom: "12px",
}

const linkStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter)",
  fontSize: "12px",
  color: "var(--color-gray)",
}

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        paddingTop: "48px",
        paddingBottom: "24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Col 1 — Brand */}
          <div>
            <Link href="/" className="inline-block leading-none">
              {/* TODO: swap with real logo PNG: <img src="/images/logo.png" height="80" alt="HoneyBee Designs" /> */}
              <span
                style={{
                  fontFamily: "var(--font-pacifico)",
                  fontSize: "24px",
                  color: "var(--color-sunflower)",
                  display: "block",
                  letterSpacing: "1px",
                  lineHeight: 1.1,
                }}
              >
                HoneyBee
              </span>
              <span
                style={{
                  fontFamily: "var(--font-montserrat)",
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "var(--color-black)",
                  fontStyle: "italic",
                  display: "block",
                  marginTop: "-2px",
                  letterSpacing: "0.1em",
                }}
              >
                designs
              </span>
            </Link>
            <p
              className="mt-3 italic"
              style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "var(--color-gray)" }}
            >
              Cute. Custom. Made for you! 🐝
            </p>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                marginTop: "8px",
                fontSize: "13px",
                color: "var(--color-gray)",
                lineHeight: 1.6,
                maxWidth: "200px",
              }}
            >
              Thank you for supporting my small business. Every order means the world to me!
            </p>
          </div>

          {/* Col 2 — Shop */}
          <div>
            <p style={columnHeadingStyle}>SHOP</p>
            <ul>
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="block leading-loose transition-colors hover:text-[var(--color-primary)]"
                    style={linkStyle}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Help */}
          <div>
            <p style={columnHeadingStyle}>HELP</p>
            <ul>
              {HELP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="block leading-loose transition-colors hover:text-[var(--color-primary)]"
                    style={linkStyle}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — About + We Accept */}
          <div>
            <p style={columnHeadingStyle}>ABOUT</p>
            <ul>
              {ABOUT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="block leading-loose transition-colors hover:text-[var(--color-primary)]"
                    style={linkStyle}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: "16px" }}>
              <p style={columnHeadingStyle}>WE ACCEPT</p>
              <div className="flex flex-wrap gap-1">
                {PAYMENT_METHODS.map((m) => (
                  <span
                    key={m}
                    className="rounded"
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                      padding: "2px 7px",
                      fontFamily: "var(--font-montserrat)",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "var(--color-gray)",
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 flex flex-col items-center justify-between gap-2 border-t pt-4 sm:flex-row"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "var(--color-gray)" }}>
            © {new Date().getFullYear()}, Honey Bee Designs. All rights reserved.
          </p>
          <p className="italic" style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "var(--color-gray)" }}>
            Unique designs made just for you! 🌻
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "var(--color-gray)" }}>
            <Link href="#" className="transition-colors hover:text-[var(--color-primary)]" style={{ color: "var(--color-gray)" }}>
              Privacy Policy
            </Link>
            {" | "}
            <Link href="#" className="transition-colors hover:text-[var(--color-primary)]" style={{ color: "var(--color-gray)" }}>
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
