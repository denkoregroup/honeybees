"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ShoppingCart, Menu, X } from "lucide-react"
import { Logo } from "@/components/layout/Logo"
import { useCartStore } from "@/store/cart"
import { isNavActive } from "./nav"

const NAV_LINKS = [
  { label: "HOME",        href: "/" },
  { label: "SHOP ALL",    href: "/shop" },
  { label: "COLLECTIONS", href: "/collections" },
  { label: "ABOUT US",    href: "/about" },
  { label: "CONTACT",     href: "/contact" },
]

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { cart, openCart } = useCartStore()
  const itemCount = cart?.totalQuantity ?? 0

  return (
    <header
      className="sticky top-0 z-40 w-full border-b"
      style={{
        backgroundColor: "var(--color-cream)",
        borderColor: "var(--color-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* ── Mobile (below md): 72px bar with menu, centered logo, shop link and cart ── */}
      <div className="md:hidden">
        <div className="grid h-[72px] grid-cols-[88px_1fr_88px] items-center px-2">
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="focus-ring flex h-11 w-11 items-center justify-center"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link href="/" className="focus-ring flex h-16 items-center justify-center">
            <Logo className="h-16 w-auto" />
          </Link>

          <div className="flex items-center justify-end">
            {/* There's no search yet (a dead search box loses buyers), so this is a plain shop link. */}
            <Link href="/shop" className="focus-ring flex h-11 w-11 items-center justify-center text-[12px] font-bold uppercase tracking-wide text-[var(--color-ink)]">
              Shop
            </Link>
            <button
              aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
              onClick={openCart}
              className="focus-ring relative flex h-11 w-11 items-center justify-center"
            >
              <ShoppingCart className="h-6 w-6" />
              <span
                className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold leading-none text-white"
                style={{ backgroundColor: "var(--color-coral-ink)" }}
              >
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            id="mobile-menu"
            aria-label="Main menu"
            className="border-t px-4 pb-4 pt-2"
            style={{ borderColor: "var(--color-border)" }}
          >
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isNavActive(pathname, link.href) ? "page" : undefined}
                    className="focus-ring flex min-h-11 items-center text-[14px] font-bold uppercase tracking-[0.06em]"
                    style={{
                      fontFamily: "var(--font-montserrat)",
                      color: "var(--color-ink)",
                      textDecoration: isNavActive(pathname, link.href) ? "underline" : undefined,
                      textUnderlineOffset: "4px",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* ── md and up: unchanged ── */}
      <div className="hidden md:contents">
      {/* ── Row 1: Hamburger · Logo · Icons ── */}
      <div
        className="grid px-6"
        style={{
          minHeight: "80px",
          paddingBlock: "8px",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Left: hamburger */}
        <div className="flex items-center gap-2">
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="tablet-menu"
            className="focus-ring rounded-full p-2 transition-colors hover:bg-[var(--color-topbar-bg)] lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen
              ? <X className="h-5 w-5" style={{ color: "var(--color-gray)" }} />
              : <Menu className="h-5 w-5" style={{ color: "var(--color-gray)" }} />
            }
          </button>

        </div>

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Link href="/" className="focus-ring flex items-center">
            <Logo className="h-[70px] w-auto" />
          </Link>
        </div>

        {/* Right: Cart. No accounts or wishlist at launch (guest checkout, #45). */}
        <div className="flex items-center justify-end gap-6">
          <button
            aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
            onClick={openCart}
            className="focus-ring relative flex flex-col items-center gap-1 transition-opacity hover:opacity-70"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" style={{ color: "var(--color-gray)" }} />
              <span
                className="absolute -right-2 -top-2 flex items-center justify-center rounded-full text-[10px] font-bold text-[var(--color-ink)]"
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "var(--color-primary)",
                }}
              >
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            </div>
            <span className="text-[10px]" style={{ color: "var(--color-gray)" }}>Cart</span>
          </button>
        </div>
      </div>

      {/* ── Row 2: Nav (desktop) ── */}
      <nav
        aria-label="Main menu"
        className="hidden border-t lg:block"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-cream)", height: "40px" }}
      >
        <ul
          className="flex items-center justify-center h-full"
          style={{ maxWidth: "1200px", margin: "0 auto", gap: "2rem", padding: "0 24px" }}
        >
          {NAV_LINKS.map((link) => {
            const active = isNavActive(pathname, link.href)
            return (
              <li key={link.href}>
                {/* Text stays ink: sunflower text on cream is 1.9:1. The sunflower underline marks the link. */}
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className="focus-ring relative inline-block whitespace-nowrap text-[var(--color-black)] transition-colors hover:text-[var(--color-coral-ink)]"
                  style={{
                    fontFamily: "var(--font-montserrat)",
                    fontSize: "12px",
                    fontWeight: active ? 700 : 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    borderBottom: active ? "2px solid var(--color-sunflower)" : undefined,
                    paddingBottom: active ? "2px" : undefined,
                  }}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <nav
          id="tablet-menu"
          aria-label="Main menu"
          className="border-t px-4 py-3 lg:hidden"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-cream)" }}
        >
          <ul className="space-y-0.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isNavActive(pathname, link.href) ? "page" : undefined}
                  className="focus-ring block rounded-lg px-3 py-2.5 text-[13px] uppercase tracking-wide transition-colors"
                  style={{
                    fontFamily: "var(--font-montserrat)",
                    fontWeight: isNavActive(pathname, link.href) ? 700 : 500,
                    color: "var(--color-black)",
                    textDecoration: isNavActive(pathname, link.href) ? "underline" : undefined,
                    textDecorationColor: "var(--color-sunflower)",
                    textDecorationThickness: "2px",
                    textUnderlineOffset: "4px",
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      </div>
    </header>
  )
}
