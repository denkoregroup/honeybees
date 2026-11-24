"use client"

import Image from "next/image"
import Link from "next/link"
import { ImageIcon } from "lucide-react"
import type { CollectionTile } from "./collection-tiles"

function CategoryTile({ name, handle, image }: CollectionTile) {
  return (
    <Link
      href={`/shop/${handle}`}
      className="focus-ring-inset group flex-shrink-0"
      style={{
        width: "120px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        textDecoration: "none",
      }}
    >
      {/* Image area */}
      <div
        className="transition-all duration-200 group-hover:-translate-y-0.5"
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "12px",
          backgroundColor: "var(--color-gray-light)",
          border: "1.5px solid var(--color-border)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = "var(--color-sunflower)"
          el.style.boxShadow = "0 4px 12px rgba(245,180,0,0.2)"
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = "var(--color-border)"
          el.style.boxShadow = "none"
        }}
      >
        {image ? (
          // Decorative: the category name is in the same link
          <Image src={image.url} alt="" fill sizes="120px" className="object-cover" />
        ) : (
          <ImageIcon
            className="h-8 w-8"
            style={{ color: "var(--color-gray)" }}
          />
        )}
      </div>

      {/* Label */}
      <span
        className="group-hover:text-[var(--color-coral-ink)] transition-colors"
        style={{
          marginTop: "8px",
          fontFamily: "var(--font-montserrat)",
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--color-black)",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {name}
      </span>
    </Link>
  )
}

const MOBILE_TILE_COUNT = 8

export function CategoryGrid({ tiles }: { tiles: CollectionTile[] }) {
  if (tiles.length === 0) return null

  return (
    <>
    {/* Mobile (below md): swipe row of small tiles, the next one peeking */}
    <section className="pb-8 md:hidden">
      <h2
        className="mb-6 px-4 text-center text-[28px] font-extrabold uppercase leading-9"
        style={{ fontFamily: "var(--font-montserrat)", color: "var(--color-ink)" }}
      >
        Shop by category
      </h2>
      <ul className="no-scrollbar flex snap-x gap-2 overflow-x-auto px-4">
        {tiles.slice(0, MOBILE_TILE_COUNT).map(({ name, handle, image }) => (
          <li key={handle} className="w-[92px] flex-shrink-0 snap-start">
            <Link href={`/shop/${handle}`} className="focus-ring-inset flex flex-col items-center gap-2">
              <span
                className="relative flex h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-xl border"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                {image ? (
                  <Image src={image.url} alt="" fill sizes="92px" className="object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8" style={{ color: "var(--color-gray)" }} aria-hidden />
                )}
              </span>
              <span
                className="text-center text-[11px] font-semibold uppercase leading-4 tracking-[0.04em]"
                style={{ fontFamily: "var(--font-montserrat)", color: "var(--color-ink)" }}
              >
                {name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>

    <section className="hidden md:block" style={{ backgroundColor: "var(--color-cream)", padding: "48px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Heading */}
        <div
          className="flex items-center justify-center"
          style={{ marginBottom: "32px" }}
        >
          <h2
            className="font-extrabold text-center"
            style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "22px",
              fontWeight: 800,
              color: "var(--color-black)",
              margin: 0,
            }}
          >
            <span aria-hidden>🤍 </span>SHOP BY CATEGORY<span aria-hidden> 🤍</span>
          </h2>
        </div>

        {/* Horizontal scroll row */}
        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "12px",
            padding: "0 24px 16px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {tiles.map((tile) => (
            <CategoryTile key={tile.handle} {...tile} />
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
          <Link
            href="/shop"
            className="focus-ring transition-colors"
            style={{
              backgroundColor: "var(--color-primary)",
              padding: "10px 32px",
              borderRadius: "9999px",
              fontFamily: "var(--font-montserrat)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textDecoration: "none",
              color: "var(--color-ink)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--color-primary-dark)"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--color-primary)"
            }}
          >
            SHOP ALL COLLECTIONS
          </Link>
        </div>
      </div>
    </section>
    </>
  )
}
