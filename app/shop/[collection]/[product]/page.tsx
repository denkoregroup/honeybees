import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductByHandle } from "@/lib/storefront"
import { PDPClient } from "./PDPClient"

interface Props {
  params: Promise<{ collection: string; product: string }>
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

export default async function ProductPage({ params }: Props) {
  const { collection, product: handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) notFound()

  return <PDPClient product={product} collectionHandle={collection} />
}
