"use client"

import { create } from "zustand"
import { addToCart, getCart, removeLine, updateLine, type CartResult } from "@/app/actions/cart"
import type { Cart } from "@/lib/storefront/types"

// UI state only. The cart itself lives at Shopify and its id in an httpOnly cookie on the server;
// `cart` is just the last snapshot a server action returned.

const REQUEST_FAILED = "Something went wrong with your cart. Please try again."

interface CartStore {
  cart: Cart | null
  /** True once the first snapshot (or error) has come back, so pages don't flash an empty cart. */
  loaded: boolean
  isOpen: boolean
  isPending: boolean
  error: string | null
  /** Repeats the operation that failed; null when there is no error. */
  retry: (() => Promise<void>) | null
  openCart: () => void
  closeCart: () => void
  refresh: () => Promise<void>
  addItem: (variantId: string, quantity: number) => Promise<void>
  updateQuantity: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
}

export const useCartStore = create<CartStore>()((set) => {
  const run = async (operation: () => Promise<CartResult>): Promise<void> => {
    set({ isPending: true, error: null, retry: null })
    let result: CartResult
    try {
      result = await operation()
    } catch {
      result = { ok: false, error: REQUEST_FAILED }
    }
    if (result.ok) {
      set({ cart: result.cart, loaded: true, isPending: false })
    } else {
      set({ error: result.error, loaded: true, isPending: false, retry: () => run(operation) })
    }
  }

  return {
    cart: null,
    loaded: false,
    isOpen: false,
    isPending: false,
    error: null,
    retry: null,
    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),
    refresh: () => run(() => getCart()),
    addItem: (variantId, quantity) => run(() => addToCart(variantId, quantity)),
    updateQuantity: (lineId, quantity) => run(() => updateLine(lineId, quantity)),
    removeItem: (lineId) => run(() => removeLine(lineId)),
  }
})
