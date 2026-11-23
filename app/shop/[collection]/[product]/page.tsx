import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCollectionByHandle, getProductByHandle } from "@/lib/storefront"
import { initialSelection } from "@/lib/variant-selection"
import { PDPClient } from "./PDPClient"

interface Props {
  params: Promise<{ collection: string; product: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product: handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) notFound()
  return {
    title: `${product.title} | HoneyBee Designs`,
    description: product.description,
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
