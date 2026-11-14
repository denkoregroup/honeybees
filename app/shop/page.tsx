import { Suspense } from "react"
import { getProducts } from "@/lib/storefront"
import { ShopAllClient } from "./ShopAllClient"

export const metadata = {
  title: "Shop All | HoneyBee Designs",
  description: "Browse all custom sublimation products — decals, keychains, apparel, drinkware & more.",
}

export default async function ShopPage() {
  // Largest page the Storefront API allows; there is no pagination UI.
  const products = await getProducts({ first: 250 })

  return (
    <Suspense>
      <ShopAllClient products={products.items} />
    </Suspense>
  )
}
