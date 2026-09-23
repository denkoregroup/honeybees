"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { HandHeart, PackageCheck, Truck, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/types"

interface PDPClientProps {
  product: Product
  collectionHandle: string
}

const customizations = [
  { label: "Design Style", options: ["Honey Bee", "Wildflower", "Name + Initials"] },
  { label: "Garment Style", options: ["Tee", "Crewneck", "Tank", "Crop Top"] },
  { label: "Brand", options: ["Gildan", "Bella Canvas", "Comfort Colors"] },
  { label: "Size", options: ["SM", "MED", "LG", "XL", "2X"] },
]

const trustItems = [
  { icon: HandHeart, label: "Handmade", detail: "with lots of love" },
  { icon: PackageCheck, label: "Packed with Care", detail: "ready for gifting" },
  { icon: Truck, label: "Fast Shipping", detail: "ships in 3–5 days" },
]

export function PDPClient({ product, collectionHandle }: PDPClientProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [color, setColor] = useState("")
  const [adding, setAdding] = useState(false)
  const [choices, setChoices] = useState<Record<string, string>>(
    Object.fromEntries(customizations.map(({ label, options }) => [label, options[0]])),
  )
  const { addItem, openCart } = useCartStore()
  const selectedVariant = product.variants.find((variant) => variant.availableForSale) ?? product.variants[0]
  const gallery = product.images.length ? product.images : Array.from({ length: 5 }, (_, index) => ({
    id: `custom-tee-${index}`,
    url: "/images/products/custom-tee.png",
    altText: "Custom HoneyBee Designs t-shirt",
  }))
  const collectionTitle = collectionHandle.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ")

  const updateChoice = (label: string, value: string) => {
    setChoices((current) => ({ ...current, [label]: value }))
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    setAdding(true)
    await addItem(selectedVariant.id, {
      productId: product.id,
      title: product.title,
      variantTitle: `${choices["Garment Style"]} · ${choices.Size}${color ? ` · ${color}` : ""}`,
      price: selectedVariant.price,
      image: gallery[0]?.url,
    })
    openCart()
    setAdding(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-14">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs font-semibold text-[var(--color-gray)]">
        <Link href="/shop" className="transition-colors hover:text-[var(--color-blush-dark)]">Shop</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/shop/${collectionHandle}`} className="transition-colors hover:text-[var(--color-blush-dark)]">{collectionTitle}</Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-[var(--color-black)]">{product.title}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-20">
        <section aria-label="Product images">
          <div className="relative aspect-[4/4.5] overflow-hidden rounded-[2rem] bg-[var(--color-warm-beige)]">
            <Image
              src={gallery[activeImage]?.url ?? "/images/products/custom-tee.png"}
              alt={gallery[activeImage]?.altText ?? product.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            <div className="absolute left-5 top-5 rounded-full bg-[var(--color-honey-yellow)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--color-black)]">Made just for you</div>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-3" aria-label="Choose product image">
            {gallery.slice(0, 5).map((image, index) => (
              <button
                key={image.id ?? index}
                type="button"
                aria-label={`View product image ${index + 1}`}
                aria-pressed={activeImage === index}
                onClick={() => setActiveImage(index)}
                className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-[var(--color-warm-beige)] transition-transform hover:-translate-y-1 ${activeImage === index ? "border-[var(--color-blush)]" : "border-transparent"}`}
              >
                <Image src={image.url} alt="" fill className="object-cover" sizes="120px" />
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col justify-center">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--color-blush-dark)]">{collectionTitle} · Custom made</p>
          <h1 className="max-w-xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[var(--color-black)] sm:text-5xl">{product.title}</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[var(--color-gray)]">{product.description}</p>
          <p className="mt-6 text-3xl font-black text-[var(--color-blush-dark)]">{formatPrice(selectedVariant?.price ?? product.price)}</p>

          <div className="mt-8 flex flex-col gap-4">
            {customizations.map(({ label, options }) => (
              <label key={label} className="flex flex-col gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--color-black)]">
                {label}
                <select
                  value={choices[label]}
                  onChange={(event) => updateChoice(label, event.target.value)}
                  className="h-12 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold normal-case tracking-normal text-[var(--color-black)] outline-none transition-colors focus:border-[var(--color-blush)] focus:ring-2 focus:ring-[var(--color-blush)]/30"
                >
                  {options.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            ))}
            <label className="flex flex-col gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--color-black)]">
              Color
              <input value={color} onChange={(event) => setColor(event.target.value)} placeholder="e.g. Buttercream" className="h-12 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold normal-case tracking-normal text-[var(--color-black)] outline-none placeholder:text-[var(--color-gray)] focus:border-[var(--color-blush)] focus:ring-2 focus:ring-[var(--color-blush)]/30" />
            </label>
          </div>

          <button type="button" onClick={handleAddToCart} disabled={adding || !selectedVariant} className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-blush)] text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--color-black)] shadow-[0_8px_0_0_#e8a0ac] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-honey-yellow)] hover:shadow-[0_8px_0_0_#f5b400] disabled:cursor-not-allowed disabled:opacity-60">
            <ShoppingBag aria-hidden="true" />
            {adding ? "Adding..." : "Add to Cart"}
          </button>

          <div className="mt-12 grid grid-cols-3 gap-3 border-t border-[var(--color-border)] pt-6">
            {trustItems.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-[var(--color-honey-yellow)] text-[var(--color-black)]"><Icon aria-hidden="true" /></span>
                <span className="text-xs font-extrabold text-[var(--color-black)]">{label}</span>
                <span className="text-[10px] leading-tight text-[var(--color-gray)]">{detail}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
