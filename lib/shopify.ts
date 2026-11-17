import { createStorefrontApiClient } from "@shopify/storefront-api-client"

// Cart operations only. Products and collections are read through lib/storefront.
// SHOPIFY_STOREFRONT_API_URL and the client below go away with #9.

// ─── Client (lazy) ────────────────────────────────────────────────────────────
let _client: ReturnType<typeof createStorefrontApiClient> | null = null

function getClient() {
  if (!_client) {
    _client = createStorefrontApiClient({
      storeDomain: process.env.SHOPIFY_STOREFRONT_API_URL!,
      apiVersion: "2024-10",
      publicAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "",
    })
  }
  return _client
}

function isConfigured() {
  return !!process.env.SHOPIFY_STOREFRONT_API_URL && !!process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
}

function devError(fn: string, err: unknown) {
  if (process.env.NODE_ENV !== "production") console.error(`[shopify:${fn}]`, err)
}

export const shopifyClient = {
  request: (...args: Parameters<ReturnType<typeof createStorefrontApiClient>["request"]>) =>
    getClient().request(...args),
}

// ─── Cart mutations ───────────────────────────────────────────────────────────
const CART_FRAGMENT = `
  id checkoutUrl
  lines(first: 100) { edges { node {
    id quantity
    merchandise { ... on ProductVariant {
      id title price { amount }
      product { id title images(first: 1) { edges { node { url altText } } } }
      selectedOptions { name value }
    }}
  }}}
  cost { totalAmount { amount currencyCode } }
`

const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate {
    cartCreate { cart { ${CART_FRAGMENT} } userErrors { field message } }
  }
`

const CART_LINES_ADD_MUTATION = `#graphql
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FRAGMENT} } userErrors { field message }
    }
  }
`

const CART_LINES_REMOVE_MUTATION = `#graphql
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FRAGMENT} } userErrors { field message }
    }
  }
`

const CART_LINES_UPDATE_MUTATION = `#graphql
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FRAGMENT} } userErrors { field message }
    }
  }
`

// ─── Normalisers ──────────────────────────────────────────────────────────────
export interface ShopifyCart {
  id: string
  checkoutUrl: string
  lines: CartLine[]
  totalAmount: number
}

export interface CartLine {
  id: string
  quantity: number
  variantId: string
  variantTitle: string
  productId: string
  productTitle: string
  price: number
  image?: string
  selectedOptions: { name: string; value: string }[]
}

function normalizeCart(cart: Record<string, unknown>): ShopifyCart {
  const lines = cart.lines as { edges: { node: Record<string, unknown> }[] }
  const cost = cart.cost as { totalAmount: { amount: string } }
  return {
    id: cart.id as string,
    checkoutUrl: cart.checkoutUrl as string,
    totalAmount: parseFloat(cost.totalAmount.amount),
    lines: lines.edges.map(({ node: line }) => {
      const merch = line.merchandise as Record<string, unknown>
      const mp = merch.price as { amount: string }
      const product = merch.product as Record<string, unknown>
      const images = product.images as { edges: { node: { url: string } }[] }
      return {
        id: line.id as string,
        quantity: line.quantity as number,
        variantId: merch.id as string,
        variantTitle: merch.title as string,
        productId: product.id as string,
        productTitle: product.title as string,
        price: parseFloat(mp.amount),
        image: images.edges[0]?.node.url,
        selectedOptions: merch.selectedOptions as { name: string; value: string }[],
      }
    }),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function createCart(): Promise<{ id: string; checkoutUrl: string } | null> {
  if (!isConfigured()) return null
  try {
    const { data, errors } = await shopifyClient.request(CART_CREATE_MUTATION)
    if (errors || !data) return null
    const result = data as { cartCreate: { cart: Record<string, unknown>; userErrors: unknown[] } }
    if (result.cartCreate.userErrors.length) return null
    const cart = result.cartCreate.cart
    return { id: cart.id as string, checkoutUrl: cart.checkoutUrl as string }
  } catch (err) {
    devError("createCart", err)
    return null
  }
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<ShopifyCart | null> {
  if (!isConfigured()) return null
  try {
    const { data, errors } = await shopifyClient.request(CART_LINES_ADD_MUTATION, {
      variables: { cartId, lines: [{ merchandiseId: variantId, quantity }] },
    })
    if (errors || !data) return null
    const result = data as { cartLinesAdd: { cart: Record<string, unknown> } }
    return normalizeCart(result.cartLinesAdd.cart)
  } catch (err) {
    devError("addToCart", err)
    return null
  }
}

export async function removeFromCart(cartId: string, lineId: string): Promise<ShopifyCart | null> {
  if (!isConfigured()) return null
  try {
    const { data, errors } = await shopifyClient.request(CART_LINES_REMOVE_MUTATION, {
      variables: { cartId, lineIds: [lineId] },
    })
    if (errors || !data) return null
    const result = data as { cartLinesRemove: { cart: Record<string, unknown> } }
    return normalizeCart(result.cartLinesRemove.cart)
  } catch (err) {
    devError("removeFromCart", err)
    return null
  }
}

export async function updateCartQuantity(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<ShopifyCart | null> {
  if (!isConfigured()) return null
  try {
    const { data, errors } = await shopifyClient.request(CART_LINES_UPDATE_MUTATION, {
      variables: { cartId, lines: [{ id: lineId, quantity }] },
    })
    if (errors || !data) return null
    const result = data as { cartLinesUpdate: { cart: Record<string, unknown> } }
    return normalizeCart(result.cartLinesUpdate.cart)
  } catch (err) {
    devError("updateCartQuantity", err)
    return null
  }
}
