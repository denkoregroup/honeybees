"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Collection } from "@/lib/storefront/types"

interface CollectionFilterProps {
  collections: Collection[]
}

export function CollectionFilter({ collections }: CollectionFilterProps) {
  const pathname = usePathname()

  return (
    <aside className="w-full md:w-48 flex-shrink-0">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Collections
      </h2>
      <nav>
        <ul className="space-y-1">
          <li>
            <Link
              href="/shop"
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                pathname === "/shop"
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80"
              )}
            >
              All Products
            </Link>
          </li>
          {collections.map((col) => (
            <li key={col.id}>
              <Link
                href={`/shop/${col.handle}`}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                  pathname === `/shop/${col.handle}`
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80"
                )}
              >
                {col.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
