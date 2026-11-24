import { HeroSection } from "@/components/home/HeroSection"
import { TrustBar } from "@/components/home/TrustBar"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { PromoBanners } from "@/components/home/PromoBanners"
import { HowItWorks } from "@/components/home/HowItWorks"
import { ShopCollections } from "@/components/home/ShopCollections"
import { EmailSignup } from "@/components/home/EmailSignup"
import { getCategoryTiles, getShopCollectionTiles } from "@/components/home/collection-tiles"
import { getProducts } from "@/lib/storefront"

const FEATURED_COUNT = 12

export default async function HomePage() {
  const [featured, categoryTiles, collectionTiles] = await Promise.all([
    getProducts({ first: FEATURED_COUNT }),
    getCategoryTiles(),
    getShopCollectionTiles(),
  ])

  return (
    <>
      <HeroSection />
      <TrustBar />
      <CategoryGrid tiles={categoryTiles} />
      <FeaturedProducts products={featured.items} />
      <PromoBanners />
      <HowItWorks />
      <ShopCollections tiles={collectionTiles} />
      <EmailSignup />
    </>
  )
}
