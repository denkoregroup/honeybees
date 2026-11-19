"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Search, User, Heart, ShoppingCart, Menu, X } from "lucide-react"
import { Logo } from "@/components/layout/Logo"
import { PARENT_COLLECTION_HANDLE } from "@/lib/storefront/hierarchy"
import { useCartStore } from "@/store/cart"
import { cn } from "@/lib/utils"

const BASE_NAV_LINKS = [
  { label: "HOME",        href: "/" },
  { label: "SHOP ALL",    href: "/shop" },
  { label: "COLLECTIONS", href: "/collections" },
  { label: "ABOUT US",    href: "/about" },
  { label: "CONTACT",     href: "/contact" },
]

export function Header({ pawsAndClaws }: { pawsAndClaws: boolean }) {
  const NAV_LINKS = pawsAndClaws
    ? [...BASE_NAV_LINKS.slice(0, 3), { label: "PAWS & CLAWS", href: `/shop/${PARENT_COLLECTION_HANDLE}` }, ...BASE_NAV_LINKS.slice(3)]
    : BASE_NAV_LINKS
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { items, openCart } = useCartStore()
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <header
      className="sticky top-0 z-40 w-full border-b"
      style={{
        backgroundColor: "var(--color-cream)",
        borderColor: "var(--color-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* ── Mobile (below md): 72px bar with menu, centered logo, search and cart ── */}
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
            {/* No search UI exists yet, so this goes to the shop. */}
            <Link href="/shop" aria-label="Search the shop" className="focus-ring flex h-11 w-11 items-center justify-center">
              <Search className="h-6 w-6" />
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
                    className="focus-ring flex min-h-11 items-center text-[14px] font-bold uppercase tracking-[0.06em]"
                    style={{
                      fontFamily: "var(--font-montserrat)",
                      color: "var(--color-ink)",
                      textDecoration: pathname === link.href ? "underline" : undefined,
                      textUnderlineOffset: "4px",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-2 border-t pt-2" style={{ borderColor: "var(--color-border)" }}>
              <li>
                <button className="focus-ring flex min-h-11 w-full items-center gap-3 text-[14px] font-bold uppercase tracking-[0.06em]" style={{ fontFamily: "var(--font-montserrat)" }}>
                  <User className="h-5 w-5" /> Account
                </button>
              </li>
              <li>
                <button className="focus-ring flex min-h-11 w-full items-center gap-3 text-[14px] font-bold uppercase tracking-[0.06em]" style={{ fontFamily: "var(--font-montserrat)" }}>
                  <Heart className="h-5 w-5" /> Wishlist
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* ── md and up: unchanged ── */}
      <div className="hidden md:contents">
      {/* ── Row 1: Hamburger · Search · Logo · Icons ── */}
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
        {/* Left: hamburger + search */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle navigation"
            className="rounded-full p-2 transition-colors hover:bg-[var(--color-topbar-bg)] lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen
              ? <X className="h-5 w-5" style={{ color: "var(--color-gray)" }} />
              : <Menu className="h-5 w-5" style={{ color: "var(--color-gray)" }} />
            }
          </button>

          {/* Search bar */}
          <div className="relative hidden sm:flex" style={{ width: "220px" }}>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search custom designs..."
              className="w-full rounded-full border py-2 pl-4 pr-10 text-[13px] outline-none transition-colors placeholder:text-[var(--color-gray)]"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)" }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)" }}
            />
            <button
              aria-label="Search"
              className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full text-white transition-colors"
              style={{
                width: "28px",
                height: "28px",
                backgroundColor: "var(--color-primary)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-dark)" }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)" }}
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <Logo className="h-[70px] w-auto" />
          </Link>
        </div>

        {/* Right: Account · Wishlist · Cart */}
        <div className="flex items-center justify-end gap-6">
          <button
            aria-label="Account"
            className="hidden flex-col items-center gap-1 transition-opacity hover:opacity-70 sm:flex"
          >
            <User className="h-5 w-5" style={{ color: "var(--color-gray)" }} />
            <span className="text-[10px]" style={{ color: "var(--color-gray)" }}>Account</span>
          </button>

          <button
            aria-label="Wishlist"
            className="hidden flex-col items-center gap-1 transition-opacity hover:opacity-70 sm:flex"
          >
            <Heart className="h-5 w-5" style={{ color: "var(--color-gray)" }} />
            <span className="text-[10px]" style={{ color: "var(--color-gray)" }}>Wishlist</span>
          </button>

          <button
            aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
            onClick={openCart}
            className="relative flex flex-col items-center gap-1 transition-opacity hover:opacity-70"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" style={{ color: "var(--color-gray)" }} />
              <span
                className="absolute -right-2 -top-2 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
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
        className="hidden border-t lg:block"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-cream)", height: "40px" }}
      >
        <ul
          className="flex items-center justify-center h-full"
          style={{ maxWidth: "1200px", margin: "0 auto", gap: "2rem", padding: "0 24px" }}
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href
            const isHome = link.href === "/"
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative inline-block whitespace-nowrap transition-colors"
                  style={{
                    fontFamily: "var(--font-montserrat)",
                    fontSize: "12px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: isHome || active
                      ? "var(--color-sunflower)"
                      : "var(--color-black)",
                    borderBottom: (active || isHome) ? "2px solid var(--color-sunflower)" : undefined,
                    paddingBottom: (active || isHome) ? "2px" : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (!isHome && !active)
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-primary)"
                  }}
                  onMouseLeave={(e) => {
                    if (!isHome && !active)
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-black)"
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
          className="border-t px-4 py-3 lg:hidden"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-cream)" }}
        >
          <div className="relative mb-3">
            <input
              type="search"
              placeholder="Search custom designs..."
              className="w-full rounded-full border py-2 pl-4 pr-10 text-[13px] outline-none focus:border-[var(--color-primary)]"
              style={{ borderColor: "var(--color-border)" }}
            />
            <button
              className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full text-white"
              style={{ width: "28px", height: "28px", backgroundColor: "var(--color-primary)" }}
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="space-y-0.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-[13px] uppercase tracking-wide transition-colors"
                  style={{
                    fontFamily: "var(--font-montserrat)",
                    fontWeight: 500,
                    color: pathname === link.href
                      ? "var(--color-sunflower)"
                      : "var(--color-black)",
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
