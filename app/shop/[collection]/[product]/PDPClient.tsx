"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingBag, Shield, Truck, RefreshCw } from "lucide-react"
import { Accordion } from "@/components/ui/accordion"
import { useCartStore } from "@/store/cart"
import { VariantPicker } from "@/components/features/VariantPicker"
import { formatMoney, saleCompareAt } from "@/lib/utils"
import { MAX_QUANTITY } from "@/lib/cart-input"
import { initialVariant } from "@/lib/variant-selection"
import type { Product, Variant } from "@/lib/storefront/types"

interface PDPClientProps {
  product: Product
  collectionHandle: string
}

const TRUST_ICONS = [
  { Icon: Truck, text: "Free shipping $75+" },
  { Icon: Shield, text: "Secure checkout" },
  { Icon: RefreshCw, text: "Easy returns" },
]

const ACCORDION_ITEMS = (description: string) => [
  {
    title: "Product Details",
    content: <p>{description}</p>,
  },
  {
    title: "Shipping & Processing",
    content: (
      <ul className="space-y-1">
        <li>• Orders typically process in 3–5 business days</li>
        <li>• Standard shipping: 5–7 business days</li>
        <li>• Free shipping on orders $75+</li>
        <li>• Expedited options available at checkout</li>
      </ul>
    ),
  },
  {
    title: "Care Instructions",
    content: (
      <ul className="space-y-1">
        <li>• Machine wash cold, inside out</li>
        <li>• Tumble dry low or hang dry</li>
        <li>• Do not iron directly on print</li>
        <li>• Do not bleach</li>
      </ul>
    ),
  },
]

export function PDPClient({ product, collectionHandle }: PDPClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(initialVariant(product.variants))
  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const { addItem, openCart, isPending } = useCartStore()

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    await addItem(selectedVariant.id, qty)
    openCart()
  }

  const price = selectedVariant?.price ?? product.priceRange.min
  const compareAt = saleCompareAt(price, selectedVariant?.compareAtPrice ?? null)

  const collectionTitle = collectionHandle
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-[12px] text-[var(--color-secondary)]">
        <Link href="/shop" className="hover:text-[var(--color-coral)]">Shop</Link>
        <span>/</span>
        <Link href={`/shop/${collectionHandle}`} className="hover:text-[var(--color-coral)]">
          {collectionTitle}
        </Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left — image gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--color-topbar)]">
            {product.images[activeImage] ? (
              <Image
                src={product.images[activeImage].url}
                alt={product.images[activeImage].altText ?? product.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-8xl">🐝</div>
            )}
            {compareAt && (
              <span className="absolute left-4 top-4 rounded-full bg-[var(--color-coral)] px-3 py-1 text-[11px] font-bold text-white">
                SALE
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setActiveImage(i)}
                  className={[
                    "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                    activeImage === i
                      ? "border-[var(--color-coral)]"
                      : "border-transparent hover:border-[var(--color-coral-light)]",
                  ].join(" ")}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? `${product.title} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — product info */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-coral)]">
              {collectionTitle}
            </p>
            <h1 className="mt-1 text-[26px] font-black leading-tight text-[var(--color-ink)]">
              {product.title}
            </h1>

            {/* Price */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-[24px] font-black text-[var(--color-ink)]">
                {formatMoney(price)}
              </span>
              {compareAt && (
                <span className="text-[16px] text-[var(--color-secondary)] line-through">
                  {formatMoney(compareAt)}
                </span>
              )}
            </div>
          </div>

          {/* Variant picker */}
          <VariantPicker product={product} selected={selectedVariant} onSelect={setSelectedVariant} />

          {/* Qty + Add to cart */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Quantity stepper */}
            <div className="flex items-center rounded-full border border-[var(--color-border)]">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3.5 py-2 text-[var(--color-secondary)] hover:text-[var(--color-ink)]"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[32px] text-center text-[14px] font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(MAX_QUANTITY, q + 1))}
                className="px-3.5 py-2 text-[var(--color-secondary)] hover:text-[var(--color-ink)]"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-coral)] px-6 py-3 text-[14px] font-bold text-white transition-all hover:bg-[var(--color-coral-dark)] disabled:opacity-60 sm:flex-none sm:min-w-[200px]"
            >
              <ShoppingBag className="h-4 w-4" />
              {isPending ? "ADDING…" : "ADD TO CART ♥"}
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 border-t border-[var(--color-border)] pt-4">
            {TRUST_ICONS.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-[12px] text-[var(--color-secondary)]">
                <Icon className="h-3.5 w-3.5 text-[var(--color-coral)]" />
                {text}
              </div>
            ))}
          </div>

          {/* Accordion */}
          <Accordion items={ACCORDION_ITEMS(product.description)} defaultOpen={0} />
        </div>
      </div>
    </div>
  )
}
