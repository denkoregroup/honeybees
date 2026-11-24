import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getCollectionByHandle } from "@/lib/storefront"
import { ProductCard } from "@/components/features/ProductCard"
import { BASE_OPEN_GRAPH, shareImage } from "@/lib/site"

interface Props {
  params: Promise<{ collection: string }>
}

// Largest page the Storefront API allows; there is no pagination UI.
const PRODUCTS_PER_COLLECTION = 250

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: handle } = await params
  const collection = await getCollectionByHandle(handle, { first: PRODUCTS_PER_COLLECTION })
  if (!collection) notFound()
  // The collection photo, else its first product's; the shared logo when it has neither.
  const image = collection.image ?? collection.products.items[0]?.featuredImage
  return {
    title: collection.title,
    // Left out when Shopify has none, so the site description stays (an empty one would replace it).
    ...(collection.description && { description: collection.description }),
    openGraph: { ...BASE_OPEN_GRAPH, ...(image && { images: [shareImage(image, collection.title)] }) },
  }
}

export default async function CollectionPage({ params }: Props) {
  const { collection: handle } = await params

  const collection = await getCollectionByHandle(handle, { first: PRODUCTS_PER_COLLECTION })
  if (!collection) notFound()

  const { title, description } = collection
  const products = collection.products.items

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-[12px] text-[var(--color-secondary)]">
        <Link href="/shop" className="focus-ring hover:text-[var(--color-coral-ink)]">
          Shop
        </Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">{title}</span>
      </nav>

      {/* Hero banner */}
      <div className="mb-10 rounded-2xl bg-[var(--color-topbar)] px-8 py-10 text-center">
        <h1 className="text-[28px] font-black text-[var(--color-ink)]">
          <span aria-hidden>♥ </span>
          {title.toUpperCase()}
          <span aria-hidden> ♥</span>
        </h1>
        {description && (
          <p className="mt-2 text-[14px] text-[var(--color-secondary)]">{description}</p>
        )}
        <p className="mt-1 text-[12px] text-[var(--color-secondary)]">
          {products.length} product{products.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl" aria-hidden>🐝</span>
          <p className="mt-4 text-[14px] text-[var(--color-secondary)]">
            No products in this collection yet. Check back soon!
          </p>
          <Link
            href="/shop"
            className="focus-ring mt-6 rounded-full bg-[var(--color-coral)] px-6 py-2.5 text-[13px] font-bold text-[var(--color-ink)] hover:bg-[var(--color-coral-dark)]"
          >
            Shop All
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} collectionHandle={handle} />
          ))}
        </div>
      )}
    </div>
  )
}
