import type { Metadata } from "next"
import Link from "next/link"
import { getCollectionTree } from "@/lib/storefront"
import type { CollectionNode } from "@/lib/storefront/types"

export const metadata: Metadata = {
  title: "Collections | HoneyBee Designs",
  description: "Shop by occasion — gifts for mamas, teachers, nurses, and everyone you love.",
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

function CollectionTiles({ collections }: { collections: CollectionNode[] }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
      {collections.map(({ id, title, handle }) => (
        <Link
          key={id}
          href={`/shop/${handle}`}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white p-4 text-center transition-all hover:border-[var(--color-coral)] hover:shadow-md"
        >
          <span className="text-3xl">{EMOJI[handle] ?? DEFAULT_EMOJI}</span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink)] group-hover:text-[var(--color-coral)]">
            {title}
          </span>
        </Link>
      ))}
    </div>
  )
}

export default async function CollectionsPage() {
  const { groups, flat } = await getCollectionTree()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Heading */}
      <h1 className="mb-2 text-center text-[28px] font-black text-[var(--color-ink)]">
        ♥ SHOP BY COLLECTION ♥
      </h1>
      <p className="mb-10 text-center text-[14px] text-[var(--color-secondary)]">
        Find the perfect custom gift for every person &amp; every moment.
      </p>

      {/* Parent collections, each with its children */}
      {groups.map(({ parent, children }) => (
        <section key={parent.handle} className="mb-10">
          <h2 className="mb-4 text-center text-[20px] font-black uppercase text-[var(--color-ink)]">
            {parent.hasProducts ? (
              <Link href={`/shop/${parent.handle}`} className="hover:text-[var(--color-coral)]">
                {parent.title}
              </Link>
            ) : (
              parent.title
            )}
          </h2>
          <CollectionTiles collections={children} />
        </section>
      ))}

      {/* Everything else */}
      {flat.length > 0 && (
        <section>
          {groups.length > 0 && (
            <h2 className="mb-4 text-center text-[20px] font-black uppercase text-[var(--color-ink)]">More collections</h2>
          )}
          <CollectionTiles collections={flat} />
        </section>
      )}

      {/* Custom order CTA */}
      <div className="my-14 rounded-2xl bg-[var(--color-ink)] px-8 py-10 text-center text-white">
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
              <span className="text-[var(--color-coral)]">✓</span>
              {item}
            </span>
          ))}
        </div>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-full bg-[var(--color-coral)] px-8 py-3 text-[14px] font-bold text-white transition-all hover:bg-[var(--color-coral-dark)]"
        >
          REQUEST A CUSTOM ORDER →
        </Link>
      </div>
    </div>
  )
}
