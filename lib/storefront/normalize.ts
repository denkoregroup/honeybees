import type {
  Collection,
  CollectionWithProducts,
  Image,
  Money,
  Page,
  PageInfo,
  PriceRange,
  Product,
  ProductSummary,
  Variant,
} from "./types"

// Raw shapes mirror the GraphQL selections in queries.ts.
interface RawImage {
  url: string
  altText: string | null
  width: number | null
  height: number | null
}
interface RawMoney {
  amount: string
  currencyCode: string
}
interface RawRange {
  minVariantPrice: RawMoney
  maxVariantPrice: RawMoney
}
export interface RawVariant {
  id: string
  title: string
  availableForSale: boolean
  price: RawMoney
  compareAtPrice: RawMoney | null
  selectedOptions: { name: string; value: string }[]
  image: RawImage | null
}
export interface RawProductSummary {
  id: string
  title: string
  handle: string
  tags: string[]
  availableForSale: boolean
  featuredImage: RawImage | null
  priceRange: RawRange
  compareAtPriceRange: RawRange
}
export interface RawProduct extends RawProductSummary {
  description: string
  descriptionHtml: string
  images: { nodes: RawImage[] }
  options: { name: string; optionValues: { name: string }[] }[]
  variants: { nodes: RawVariant[] }
  collections: { nodes: { id: string; title: string; handle: string }[] }
}
export interface RawCollection {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  image: RawImage | null
}
export interface RawConnection<T> {
  nodes: T[]
  pageInfo: PageInfo
}

const money = (m: RawMoney): Money => ({ amount: m.amount, currencyCode: m.currencyCode })

const image = (i: RawImage | null): Image | null =>
  i ? { url: i.url, altText: i.altText ?? null, width: i.width ?? null, height: i.height ?? null } : null

const range = (r: RawRange): PriceRange => ({
  min: money(r.minVariantPrice),
  max: money(r.maxVariantPrice),
})

function variant(v: RawVariant): Variant {
  return {
    id: v.id,
    title: v.title,
    availableForSale: v.availableForSale,
    price: money(v.price),
    compareAtPrice: v.compareAtPrice ? money(v.compareAtPrice) : null,
    selectedOptions: v.selectedOptions.map(({ name, value }) => ({ name, value })),
    image: image(v.image),
  }
}

export function normalizeProductSummary(p: RawProductSummary): ProductSummary {
  const compareAt = range(p.compareAtPriceRange)
  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    tags: p.tags,
    availableForSale: p.availableForSale,
    featuredImage: image(p.featuredImage),
    priceRange: range(p.priceRange),
    compareAtPriceRange: Number(compareAt.max.amount) > 0 ? compareAt : null,
  }
}

export function normalizeProduct(p: RawProduct): Product {
  return {
    ...normalizeProductSummary(p),
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    images: p.images.nodes.map((i) => image(i)!),
    options: p.options.map((o) => ({ name: o.name, values: o.optionValues.map((v) => v.name) })),
    variants: p.variants.nodes.map(variant),
    collections: p.collections.nodes.map(({ id, title, handle }) => ({ id, title, handle })),
  }
}

export function normalizeCollection(c: RawCollection): Collection {
  return {
    id: c.id,
    title: c.title,
    handle: c.handle,
    description: c.description,
    descriptionHtml: c.descriptionHtml,
    image: image(c.image),
  }
}

export function normalizePage<Raw, Out>(
  connection: RawConnection<Raw>,
  map: (raw: Raw) => Out
): Page<Out> {
  return {
    items: connection.nodes.map(map),
    pageInfo: {
      hasNextPage: connection.pageInfo.hasNextPage,
      endCursor: connection.pageInfo.endCursor ?? null,
    },
  }
}

export function normalizeCollectionWithProducts(
  c: RawCollection & { products: RawConnection<RawProductSummary> }
): CollectionWithProducts {
  return { ...normalizeCollection(c), products: normalizePage(c.products, normalizeProductSummary) }
}
