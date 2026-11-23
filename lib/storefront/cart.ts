import "server-only"

import { cartRequest } from "./client"
import { ShopifyApiError } from "./errors"
import type { Cart } from "./types"

// Fields checked against the Storefront API reference for the API version in use (Cart, CartLine,
// CartLineCost, CartCost, CartLineInput, CartLineUpdateInput, CartUserError).
const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
  lines(first: 100) {
    nodes {
      id
      quantity
      attributes { key value }
      cost { amountPerQuantity { amount currencyCode } totalAmount { amount currencyCode } }
      merchandise {
        ... on ProductVariant {
          title
          image { url altText width height }
          product { title }
        }
      }
    }
  }
`

// Only the error code and field are requested; messages are never needed and never surfaced.
const USER_ERRORS = `userErrors { code field }`

const CART_QUERY = `#graphql
  query Cart($id: ID!) {
    cart(id: $id) { ${CART_FIELDS} }
  }
`

const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { ${CART_FIELDS} }
      ${USER_ERRORS}
    }
  }
`

const CART_LINES_ADD_MUTATION = `#graphql
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      ${USER_ERRORS}
    }
  }
`

const CART_LINES_UPDATE_MUTATION = `#graphql
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      ${USER_ERRORS}
    }
  }
`

const CART_LINES_REMOVE_MUTATION = `#graphql
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FIELDS} }
      ${USER_ERRORS}
    }
  }
`

interface RawMoney {
  amount: string
  currencyCode: string
}

interface RawCart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: { subtotalAmount: RawMoney; totalAmount: RawMoney }
  lines: {
    nodes: {
      id: string
      quantity: number
      attributes: { key: string; value: string }[]
      cost: { amountPerQuantity: RawMoney; totalAmount: RawMoney }
      merchandise: {
        title: string
        image: { url: string; altText: string | null; width: number | null; height: number | null } | null
        product: { title: string }
      }
    }[]
  }
}

interface MutationPayload {
  cart: RawCart | null
  userErrors: { code: string | null; field: string[] | null }[]
}

/** A cart and the id that identifies it at Shopify. The id is a secret: keep it on the server. */
export interface StoredCart {
  cartId: string
  cart: Cart
}

function normalizeCart(raw: RawCart): StoredCart {
  return {
    cartId: raw.id,
    cart: {
      checkoutUrl: raw.checkoutUrl,
      totalQuantity: raw.totalQuantity,
      subtotal: raw.cost.subtotalAmount,
      total: raw.cost.totalAmount,
      lines: raw.lines.nodes.map((line) => ({
        id: line.id,
        title: line.merchandise.product.title,
        variantTitle: line.merchandise.title,
        image: line.merchandise.image,
        quantity: line.quantity,
        unitPrice: line.cost.amountPerQuantity,
        totalPrice: line.cost.totalAmount,
        attributes: line.attributes,
      })),
    },
  }
}

/** Throws when Shopify reports user errors; logs only the operation and the error codes. */
function unwrap(operation: string, payload: MutationPayload): StoredCart {
  if (payload.userErrors.length > 0 || !payload.cart) {
    const codes = payload.userErrors.map((e) => e.code).join(",")
    console.error(`[shopify] ${operation} returned user errors`, { codes })
    throw new ShopifyApiError(operation, `user errors: ${codes}`)
  }
  return normalizeCart(payload.cart)
}

/** The cart, or null when Shopify no longer has it (expired or deleted). */
export async function getCart(cartId: string): Promise<StoredCart | null> {
  const data = await cartRequest<{ cart: RawCart | null }>("getCart", CART_QUERY, { id: cartId })
  return data.cart ? normalizeCart(data.cart) : null
}

/** A line to add. `attributes` is left out entirely when there are none, so ordinary adds are unchanged. */
function lineInput(variantId: string, quantity: number, attributes: LineAttribute[]) {
  return attributes.length > 0 ? { merchandiseId: variantId, quantity, attributes } : { merchandiseId: variantId, quantity }
}

export interface LineAttribute {
  key: string
  value: string
}

async function createCart(variantId: string, quantity: number, attributes: LineAttribute[]): Promise<StoredCart> {
  const data = await cartRequest<{ cartCreate: MutationPayload }>("cartCreate", CART_CREATE_MUTATION, {
    lines: [lineInput(variantId, quantity, attributes)],
  })
  return unwrap("cartCreate", data.cartCreate)
}

/**
 * Adds a line. Without a cart id, or when Shopify says the cart is gone, a new cart is created with
 * the line in it. The returned `cartId` is the one to keep.
 *
 * `attributes` ride on the line. Each call is its own request, so nothing here merges lines: Shopify
 * keeps lines for the same variant apart when their attributes differ.
 */
export async function addLine(
  cartId: string | undefined,
  variantId: string,
  quantity: number,
  attributes: LineAttribute[] = []
): Promise<StoredCart> {
  if (!cartId) return createCart(variantId, quantity, attributes)

  const data = await cartRequest<{ cartLinesAdd: MutationPayload }>("cartLinesAdd", CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [lineInput(variantId, quantity, attributes)],
  })
  if (data.cartLinesAdd.userErrors.length > 0 && (await getCart(cartId)) === null) {
    return createCart(variantId, quantity, attributes)
  }
  return unwrap("cartLinesAdd", data.cartLinesAdd)
}

export async function updateLine(cartId: string, lineId: string, quantity: number): Promise<StoredCart> {
  const data = await cartRequest<{ cartLinesUpdate: MutationPayload }>(
    "cartLinesUpdate",
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines: [{ id: lineId, quantity }] }
  )
  return unwrap("cartLinesUpdate", data.cartLinesUpdate)
}

export async function removeLine(cartId: string, lineId: string): Promise<StoredCart> {
  const data = await cartRequest<{ cartLinesRemove: MutationPayload }>(
    "cartLinesRemove",
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds: [lineId] }
  )
  return unwrap("cartLinesRemove", data.cartLinesRemove)
}
