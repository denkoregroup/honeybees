import type { Metadata } from "next"
import type { Image, ProductSummary } from "@/lib/storefront/types"

/** Public origin of the site. Set NEXT_PUBLIC_SITE_URL to the real domain at cutover (#43). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://honeybeedesigns.com"

export const SITE_NAME = "HoneyBee Designs"

/**
 * Open Graph fields every page shares. A page that sets its own `openGraph` replaces the layout's
 * whole object (Next merges metadata shallowly), so such pages spread this in first.
 */
export const BASE_OPEN_GRAPH: NonNullable<Metadata["openGraph"]> = {
  type: "website",
  locale: "en_US",
  siteName: SITE_NAME,
  images: [{ url: "/images/logo.png", width: 1536, height: 709, alt: SITE_NAME }],
}

/** A Shopify image as an Open Graph image; `fallbackAlt` is used when Shopify has no alt text. */
export function shareImage(image: Image, fallbackAlt: string) {
  return {
    url: image.url,
    alt: image.altText || fallbackAlt,
    ...(image.width && image.height && { width: image.width, height: image.height }),
  }
}

/** Handles can contain emoji, so each path segment is percent-encoded. */
export function collectionPath(handle: string): string {
  return `/shop/${encodeURIComponent(handle)}`
}

/**
 * The one URL a product is linked at outside a collection page: under its first collection, as
 * ProductCard (without a collection) and the home page's featured products build it.
 */
export function productPath(product: Pick<ProductSummary, "handle" | "collections">): string {
  const collection = product.collections[0]?.handle ?? "shop"
  return `${collectionPath(collection)}/${encodeURIComponent(product.handle)}`
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href
}
