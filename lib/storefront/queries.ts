/** Variants fetched with the product; further pages come from PRODUCT_VARIANTS_QUERY. */
export const VARIANTS_PAGE_SIZE = 100

const MONEY = `amount currencyCode`
const IMAGE = `url altText width height`

/** Everything a product card needs; no variants, so list queries stay small. */
const PRODUCT_CARD_FIELDS = `
  id
  title
  handle
  tags
  availableForSale
  featuredImage { ${IMAGE} }
  priceRange { minVariantPrice { ${MONEY} } maxVariantPrice { ${MONEY} } }
  compareAtPriceRange { minVariantPrice { ${MONEY} } maxVariantPrice { ${MONEY} } }
`

const VARIANT_FIELDS = `
  id
  title
  availableForSale
  price { ${MONEY} }
  compareAtPrice { ${MONEY} }
  selectedOptions { name value }
  image { ${IMAGE} }
`

const PAGE_INFO = `pageInfo { hasNextPage endCursor }`

/** Full detail selection for the product page. Variants are paginated; see getProductByHandle. */
const PRODUCT_DETAIL_FIELDS = `
  ${PRODUCT_CARD_FIELDS}
  description
  descriptionHtml
  images(first: 20) { nodes { ${IMAGE} } }
  options { name optionValues { name } }
  variants(first: ${VARIANTS_PAGE_SIZE}) {
    nodes { ${VARIANT_FIELDS} }
    ${PAGE_INFO}
  }
  collections(first: 10) { nodes { id title handle } }
`

const COLLECTION_FIELDS = `
  id
  title
  handle
  description
  descriptionHtml
  image { ${IMAGE} }
`

export const PRODUCTS_QUERY = `#graphql
  query Products($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes { ${PRODUCT_CARD_FIELDS} }
      ${PAGE_INFO}
    }
  }
`

export const PRODUCT_BY_HANDLE_QUERY = `#graphql
  query ProductByHandle($handle: String!) {
    product(handle: $handle) { ${PRODUCT_DETAIL_FIELDS} }
  }
`

export const COLLECTIONS_QUERY = `#graphql
  query Collections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      nodes { ${COLLECTION_FIELDS} }
      ${PAGE_INFO}
    }
  }
`

export const COLLECTION_BY_HANDLE_QUERY = `#graphql
  query CollectionByHandle($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      ${COLLECTION_FIELDS}
      products(first: $first, after: $after) {
        nodes { ${PRODUCT_CARD_FIELDS} }
        ${PAGE_INFO}
      }
    }
  }
`

export const PRODUCT_VARIANTS_QUERY = `#graphql
  query ProductVariants($handle: String!, $first: Int!, $after: String) {
    product(handle: $handle) {
      variants(first: $first, after: $after) {
        nodes { ${VARIANT_FIELDS} }
        ${PAGE_INFO}
      }
    }
  }
`
