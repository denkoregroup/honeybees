import type { Metadata } from "next"
import Link from "next/link"
import { getCollections } from "@/lib/storefront"

export const metadata: Metadata = {
  title: "Collections",
  description: "Find the perfect custom gift for every person & every moment.",
}

// Presentation only: Shopify has no emoji field, so known collection handles get their tile emoji here.
const EMOJI: Record<string, string> = {
  mama: "💛",
  teacher: "🍎",
  nurse: "💉",
  "dog-mom": "🐾",
  bride: "💍",
  bachelorette: "🎉",
  birthday: "🎂",
  christmas: "🎄",
  halloween: "🎃",
  valentines: "💝",
  easter: "🐣",
  "fourth-of-july": "🇺🇸",
  fall: "🍂",
  summer: "☀️",
  beach: "🌊",
  "sports-mom": "⚽",
  farmer: "🌾",
  fishing: "🎣",
  camping: "⛺",
  "coffee-lover": "☕",
  "cat-mom": "🐱",
  grandma: "🌷",
}
const DEFAULT_EMOJI = "🐝"

export default async function CollectionsPage() {
  // Largest page the Storefront API allows; there is no pagination UI.
  const collections = await getCollections({ first: 250 })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Heading */}
      <h1 className="mb-2 text-center text-[28px] font-black text-[var(--color-ink)]">
        <span aria-hidden>♥ </span>SHOP BY COLLECTION<span aria-hidden> ♥</span>
      </h1>
      <p className="mb-10 text-center text-[14px] text-[var(--color-secondary)]">
        Find the perfect custom gift for every person &amp; every moment.
      </p>

      {/* Collection grid: 2 across on phones, where 3 would cut long one-word titles like BACHELORETTE */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {collections.items.map(({ id, title, handle }) => (
          <Link
            key={id}
            href={`/shop/${handle}`}
            className="focus-ring group flex flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white p-4 text-center transition-all hover:border-[var(--color-coral-ink)] hover:shadow-md"
          >
            <span className="text-3xl" aria-hidden>
              {EMOJI[handle] ?? DEFAULT_EMOJI}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink)] group-hover:text-[var(--color-coral-ink)]">
              {title}
            </span>
          </Link>
        ))}
      </div>

      {/* Custom order CTA */}
      <div className="my-14 rounded-2xl bg-[var(--color-ink)] px-8 py-10 text-center text-white">
        {/* Blush on the ink panel is about 11:1, so it stays */}
        <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-coral)]">
          Don&apos;t see your occasion?
        </p>
        <h2 className="mt-2 text-[24px] font-black">WE DO CUSTOM ORDERS!</h2>
        <p className="mt-2 text-[14px] text-gray-300">
          Any name, any photo, any design — we make it happen.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-[13px] text-gray-300">
          {["Custom names & text", "Photo uploads", "Any occasion", "Fast turnaround", "Made with love"].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <span className="text-[var(--color-coral)]" aria-hidden>
                ✓
              </span>
              {item}
            </span>
          ))}
        </div>
        <Link
          href="/contact"
          className="focus-ring mt-6 inline-block rounded-full bg-[var(--color-coral)] px-8 py-3 text-[14px] font-bold text-[var(--color-ink)] transition-all hover:bg-[var(--color-coral-dark)]"
        >
          REQUEST A CUSTOM ORDER <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  )
}
