"use client"

import { useState } from "react"
import { ProductCard } from "@/components/features/ProductCard"
import { ShopFilters } from "@/components/features/ShopFilters"
import type { ProductSummary } from "@/lib/storefront/types"

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Apparel", value: "apparel" },
  { label: "Drinkware", value: "drinkware" },
  { label: "Keychains", value: "keychains" },
  { label: "Stickers & Decals", value: "stickers-decals" },
  { label: "Gift Ideas", value: "gift-ideas" },
  { label: "Dog Tags", value: "dog-tags" },
  { label: "Car Coasters", value: "car-coasters" },
  { label: "Vinyl Decals", value: "vinyl-decals" },
  { label: "Custom Signs", value: "custom-signs" },
]

interface ShopAllClientProps {
  products: ProductSummary[]
}

export function ShopAllClient({ products }: ShopAllClientProps) {
  const [activeFilter, setActiveFilter] = useState("all")

  const filtered =
    activeFilter === "all"
      ? products
      : products.filter((p) => p.collections.some((c) => c.handle === activeFilter))

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Heading */}
      <h1 className="mb-2 text-center text-[28px] font-black text-[var(--color-ink)]">
        ♥ SHOP ALL ♥
      </h1>
      <p className="mb-8 text-center text-[13px] text-[var(--color-secondary)]">
        {filtered.length} product{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Filters */}
      <div className="mb-8">
        <ShopFilters
          options={FILTER_OPTIONS}
          active={activeFilter}
          onChange={setActiveFilter}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl">🐝</span>
          <p className="mt-4 text-[14px] text-[var(--color-secondary)]">
            No products found in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
