import type {
  Collection,
  CollectionWithProducts,
  Image,
  Money,
  Page,
  PageInfo,
  PriceRange,
  Product,
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
interface RawVariant {
  id: string
  title: string
  availableForSale: boolean
  price: RawMoney
  compareAtPrice: RawMoney | null
  selectedOptions: { name: string; value: string }[]
  image: RawImage | null
}
export interface RawProduct {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  tags: string[]
  availableForSale: boolean
  featuredImage: RawImage | null
  images: { nodes: RawImage[] }
  priceRange: RawRange
  compareAtPriceRange: RawRange
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

export function normalizeProduct(p: RawProduct): Product {
  const compareAt = range(p.compareAtPriceRange)
  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    tags: p.tags,
    availableForSale: p.availableForSale,
    featuredImage: image(p.featuredImage),
    images: p.images.nodes.map((i) => image(i)!),
    priceRange: range(p.priceRange),
    compareAtPriceRange: Number(compareAt.max.amount) > 0 ? compareAt : null,
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
  c: RawCollection & { products: RawConnection<RawProduct> }
): CollectionWithProducts {
  return { ...normalizeCollection(c), products: normalizePage(c.products, normalizeProduct) }
}
