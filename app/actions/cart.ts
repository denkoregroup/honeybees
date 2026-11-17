"use server"

import { cookies } from "next/headers"
import {
  addLine,
  getCart as getStoredCart,
  removeLine as removeShopifyLine,
  updateLine as updateShopifyLine,
} from "@/lib/storefront"
import type { Cart } from "@/lib/storefront/types"
import { parseCartId, parseLineId, parseQuantity, parseVariantId } from "@/lib/cart-input"

// The cart id never reaches the browser: it lives in this httpOnly cookie and the actions return the
// cart contents only.
const CART_COOKIE = "cart"
const THIRTY_DAYS = 60 * 60 * 24 * 30

const CART_ERROR = "Something went wrong with your cart. Please try again."

export type CartResult = { ok: true; cart: Cart | null } | { ok: false; error: string }

async function readCartId(): Promise<string | undefined> {
  const value = (await cookies()).get(CART_COOKIE)?.value
  return parseCartId(value) ?? undefined
}

async function storeCartId(cartId: string) {
  ;(await cookies()).set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: THIRTY_DAYS,
    path: "/",
  })
}

/** Runs a cart operation and turns any failure into a user-safe result; the cause is logged, not returned. */
async function run(name: string, operation: () => Promise<Cart | null>): Promise<CartResult> {
  try {
    return { ok: true, cart: await operation() }
  } catch (error) {
    console.error(`[cart] ${name} failed`, error instanceof Error ? error.name : "unknown error")
    return { ok: false, error: CART_ERROR }
  }
}

const invalid = (name: string): CartResult => {
  console.error(`[cart] ${name} rejected invalid input`)
  return { ok: false, error: CART_ERROR }
}

/** The current cart, or null when there is none (no cookie, or Shopify no longer has it). */
export async function getCart(): Promise<CartResult> {
  return run("getCart", async () => {
    const cartId = await readCartId()
    if (!cartId) return null

    const stored = await getStoredCart(cartId)
    if (!stored) {
      ;(await cookies()).delete(CART_COOKIE)
      return null
    }
    return stored.cart
  })
}

export async function addToCart(variantId: string, quantity: number): Promise<CartResult> {
  const variant = parseVariantId(variantId)
  const count = parseQuantity(quantity, 1)
  if (!variant || count === null) return invalid("addToCart")

  return run("addToCart", async () => {
    const stored = await addLine(await readCartId(), variant, count)
    await storeCartId(stored.cartId)
    return stored.cart
  })
}

/** Sets a line's quantity; 0 removes the line. */
export async function updateLine(lineId: string, quantity: number): Promise<CartResult> {
  const line = parseLineId(lineId)
  const count = parseQuantity(quantity, 0)
  if (!line || count === null) return invalid("updateLine")
  if (count === 0) return removeCartLine(line)

  return run("updateLine", async () => {
    const cartId = await readCartId()
    return cartId ? (await updateShopifyLine(cartId, line, count)).cart : null
  })
}

export async function removeLine(lineId: string): Promise<CartResult> {
  const line = parseLineId(lineId)
  if (!line) return invalid("removeLine")
  return removeCartLine(line)
}

function removeCartLine(line: string): Promise<CartResult> {
  return run("removeLine", async () => {
    const cartId = await readCartId()
    return cartId ? (await removeShopifyLine(cartId, line)).cart : null
  })
}
