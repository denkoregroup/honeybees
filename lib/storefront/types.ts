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

/** Card-level product data returned by list queries. */
export interface ProductSummary {
  id: string
  title: string
  handle: string
  tags: string[]
  availableForSale: boolean
  featuredImage: Image | null
  priceRange: PriceRange
  /** null when no variant has a compare-at price (Shopify reports 0.0 in that case). */
  compareAtPriceRange: PriceRange | null
  /** Collections the product belongs to; match against the collection handle. */
  collections: CollectionRef[]
}

/** Full product for the detail page, from getProductByHandle. */
export interface Product extends ProductSummary {
  description: string
  descriptionHtml: string
  images: Image[]
  options: ProductOption[]
  variants: Variant[]
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

export type CollectionWithProducts = Collection & { products: Page<ProductSummary> }

export interface PageArgs {
  /** Page size, 1-250. */
  first?: number
  /** `pageInfo.endCursor` from the previous page. */
  after?: string | null
}

/**
 * A collection plus what the hierarchy needs. Shopify has no nested collections, so a child names its
 * parent in the `custom.parent_collection` metafield (the parent's handle).
 */
export interface CollectionNode extends Collection {
  parentHandle: string | null
  hasProducts: boolean
}

export interface CollectionGroup {
  parent: CollectionNode
  /** Only children that have products. */
  children: CollectionNode[]
}

export interface CollectionTree {
  /** Parents that have at least one child with products. */
  groups: CollectionGroup[]
  /** Everything else that has products and isn't under a parent. */
  flat: CollectionNode[]
}
