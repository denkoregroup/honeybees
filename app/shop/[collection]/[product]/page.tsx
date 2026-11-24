import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCollectionByHandle, getProductByHandle } from "@/lib/storefront"
import { initialSelection } from "@/lib/variant-selection"
import { BASE_OPEN_GRAPH, productPath, shareImage } from "@/lib/site"
import { PDPClient } from "./PDPClient"

interface Props {
  params: Promise<{ collection: string; product: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product: handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) notFound()
  // A product is reachable under every collection it's in; point search engines at the one the site links.
  const canonical = productPath(product)
  const image = product.featuredImage
  return {
    title: product.title,
    // Left out when Shopify has none, so the site description stays (an empty one would replace it).
    ...(product.description && { description: product.description }),
    alternates: { canonical },
    openGraph: { ...BASE_OPEN_GRAPH, url: canonical, ...(image && { images: [shareImage(image, product.title)] }) },
  }
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { collection: collectionHandle, product: handle } = await params
  // The collection is only here for its title (breadcrumb and label), so ask for one product, not a page.
  const [product, collection] = await Promise.all([
    getProductByHandle(handle),
    getCollectionByHandle(collectionHandle, { first: 1 }),
  ])
  if (!product) notFound()

  // Options named in the URL (?Size=Large&Color=Sand) start selected; without them nothing does.
  const preselected = initialSelection(product.options, await searchParams)

  return (
    <PDPClient
      product={product}
      collection={collection && { handle: collection.handle, title: collection.title }}
      preselected={preselected}
    />
  )
}
