const MONEY = `amount currencyCode`
const IMAGE = `url altText width height`

const PRODUCT_FIELDS = `
  id
  title
  handle
  description
  descriptionHtml
  tags
  availableForSale
  featuredImage { ${IMAGE} }
  images(first: 20) { nodes { ${IMAGE} } }
  priceRange { minVariantPrice { ${MONEY} } maxVariantPrice { ${MONEY} } }
  compareAtPriceRange { minVariantPrice { ${MONEY} } maxVariantPrice { ${MONEY} } }
  options { name optionValues { name } }
  variants(first: 100) {
    nodes {
      id
      title
      availableForSale
      price { ${MONEY} }
      compareAtPrice { ${MONEY} }
      selectedOptions { name value }
      image { ${IMAGE} }
    }
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

const PAGE_INFO = `pageInfo { hasNextPage endCursor }`

export const PRODUCTS_QUERY = `#graphql
  query Products($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes { ${PRODUCT_FIELDS} }
      ${PAGE_INFO}
    }
  }
`

export const PRODUCT_BY_HANDLE_QUERY = `#graphql
  query ProductByHandle($handle: String!) {
    product(handle: $handle) { ${PRODUCT_FIELDS} }
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
        nodes { ${PRODUCT_FIELDS} }
        ${PAGE_INFO}
      }
    }
  }
`
