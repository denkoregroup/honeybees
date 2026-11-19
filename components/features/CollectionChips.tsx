import Link from "next/link"
import type { CollectionGroup } from "@/lib/storefront/types"

const base = "rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-wide transition-all"
const active = "bg-[var(--color-coral)] text-white shadow-sm"
const idle =
  "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"

/** "All" (the parent page you are on) plus one link per non-empty child collection. */
export function CollectionChips({ group }: { group: CollectionGroup }) {
  const { parent, children } = group
  return (
    <nav aria-label={`${parent.title} collections`} className="mb-8 flex flex-wrap gap-2">
      <Link href={`/shop/${parent.handle}`} aria-current="page" className={`${base} ${active}`}>
        All
      </Link>
      {children.map((child) => (
        <Link key={child.id} href={`/shop/${child.handle}`} className={`${base} ${idle}`}>
          {child.title}
        </Link>
      ))}
    </nav>
  )
}
