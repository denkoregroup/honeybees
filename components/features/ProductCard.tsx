import Link from "next/link"
import Image from "next/image"
import { formatMoney, saleCompareAt } from "@/lib/utils"
import type { ProductSummary } from "@/lib/storefront/types"

interface ProductCardProps {
  product: ProductSummary
  collectionHandle?: string
}

export function ProductCard({ product, collectionHandle }: ProductCardProps) {
  const collection = collectionHandle ?? product.collections[0]?.handle ?? "shop"
  const href = `/shop/${collection}/${product.handle}`
  const image = product.featuredImage
  const price = product.priceRange.min
  const compareAt = saleCompareAt(price, product.compareAtPriceRange?.min ?? null)

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Image — portrait 3:4 */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl bg-[var(--color-background)]">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            🐝
          </div>
        )}
        {compareAt && (
          <span className="absolute left-2 top-2 rounded-full bg-[var(--color-coral)] px-2 py-0.5 text-[10px] font-bold text-white">
            SALE
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3 text-center">
        <p className="line-clamp-2 text-[13px] font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-coral)] transition-colors">
          {product.title}
        </p>

        <div className="flex items-center justify-center gap-2">
          <span className="text-[14px] font-semibold text-[var(--color-ink)]">
            {formatMoney(price)}
          </span>
          {compareAt && (
            <span className="text-[12px] text-[var(--color-secondary)] line-through">
              {formatMoney(compareAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
