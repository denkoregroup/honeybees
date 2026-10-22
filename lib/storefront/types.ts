/** Shopify returns `amount` as a Decimal string (e.g. "24.99"); kept as a string to avoid float drift. */
export interface Money {
  amount: string
  currencyCode: string
}

export interface PriceRange {
  min: Money
  max: Money
}

export interface Image {
  url: string
  altText: string | null
  width: number | null
  height: number | null
}

export interface SelectedOption {
  name: string
  value: string
}

export interface ProductOption {
  name: string
  values: string[]
}

export interface Variant {
  id: string
  title: string
  availableForSale: boolean
  price: Money
  compareAtPrice: Money | null
  selectedOptions: SelectedOption[]
  image: Image | null
}

export interface CollectionRef {
  id: string
  title: string
  handle: string
}

export interface Product {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  tags: string[]
  availableForSale: boolean
  featuredImage: Image | null
  images: Image[]
  priceRange: PriceRange
  /** null when no variant has a compare-at price (Shopify reports 0.0 in that case). */
  compareAtPriceRange: PriceRange | null
  options: ProductOption[]
  variants: Variant[]
  /** Collections the product belongs to; match against the collection handle. */
  collections: CollectionRef[]
}

export interface Collection {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  image: Image | null
}

export interface PageInfo {
  hasNextPage: boolean
  endCursor: string | null
}

export interface Page<T> {
  items: T[]
  pageInfo: PageInfo
}

export type CollectionWithProducts = Collection & { products: Page<Product> }

export interface PageArgs {
  /** Page size, 1-250. */
  first?: number
  /** `pageInfo.endCursor` from the previous page. */
  after?: string | null
}
