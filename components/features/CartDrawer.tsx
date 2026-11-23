"use client"

import { useEffect } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import { Minus, Plus, Trash2, ShoppingCart, X } from "lucide-react"
import { CheckoutButton } from "@/components/features/CheckoutButton"
import { useCartStore } from "@/store/cart"
import { formatMoney, formatPrice } from "@/lib/utils"

const FREE_SHIPPING_THRESHOLD = 75

export function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, updateQuantity, isPending, error, retry, refresh } =
    useCartStore()

  // Load the saved cart once so the header count and drawer are right after a page load.
  useEffect(() => {
    void refresh()
  }, [refresh])

  const lines = cart?.lines ?? []
  const cartTotal = cart ? Number(cart.subtotal.amount) : 0
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal)
  const progressPct = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[var(--color-coral)]" />
                <h2 className="text-[16px] font-semibold text-[var(--color-ink)]">
                  Your Cart
                  {cart && cart.totalQuantity > 0 && (
                    <span className="ml-1.5 text-[13px] font-normal text-[var(--color-secondary)]">
                      ({cart.totalQuantity} item{cart.totalQuantity !== 1 ? "s" : ""})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="rounded-full p-1.5 transition-colors hover:bg-[var(--color-topbar)]"
              >
                <X className="h-5 w-5 text-[var(--color-secondary)]" />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div role="alert" className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-red-50 px-5 py-3">
                <p className="text-[12px] text-red-600">{error}</p>
                {retry && (
                  <button
                    onClick={() => void retry()}
                    disabled={isPending}
                    className="flex-shrink-0 rounded-full border border-red-300 px-3 py-1 text-[12px] font-semibold text-red-600 hover:bg-red-100 disabled:opacity-40"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            {/* Free shipping progress */}
            {lines.length > 0 && (
              <div className="border-b border-[var(--color-border)] bg-[var(--color-topbar)] px-5 py-3">
                {remaining > 0 ? (
                  <p className="mb-2 text-[12px] text-[var(--color-secondary)]">
                    You&apos;re{" "}
                    <span className="font-bold text-[var(--color-ink)]">
                      {formatPrice(remaining)}
                    </span>{" "}
                    away from free shipping!
                  </p>
                ) : (
                  <p className="mb-2 text-[12px] font-bold text-[var(--color-coral)]">
                    🎉 You&apos;ve unlocked FREE shipping!
                  </p>
                )}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                  <motion.div
                    className="h-full rounded-full bg-[var(--color-coral)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            )}

            {/* Content */}
            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
                <span className="text-5xl">🛒</span>
                <p className="text-[16px] font-semibold text-[var(--color-ink)]">
                  Your cart is empty
                </p>
                <p className="text-[13px] text-[var(--color-secondary)]">
                  Add some goodies and come back!
                </p>
                <button
                  onClick={closeCart}
                  className="mt-2 rounded-full bg-[var(--color-coral)] px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-coral-dark)]"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Items list */}
                <ul className="flex-1 divide-y divide-[var(--color-border)] overflow-y-auto px-5 py-2">
                  {lines.map((item) => {
                    return (
                      <li key={item.id} className="flex gap-4 py-4">
                        {/* Image */}
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--color-topbar)]">
                          {item.image ? (
                            <Image
                              src={item.image.url}
                              alt={item.image.altText ?? item.title}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-2xl">🐝</div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[14px] font-semibold leading-tight text-[var(--color-ink)]">
                                {item.title}
                              </p>
                              {item.variantTitle !== "Default Title" && (
                                <p className="mt-0.5 text-[12px] text-[var(--color-secondary)]">
                                  {item.variantTitle}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              aria-label="Remove item"
                              disabled={isPending}
                              className="flex-shrink-0 rounded p-0.5 text-[var(--color-secondary)] transition-colors hover:text-red-500 disabled:opacity-40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Qty */}
                            <div className="flex items-center rounded-lg border border-[var(--color-border)]">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label="Decrease quantity"
                                disabled={isPending}
                                className="px-2.5 py-1 text-[var(--color-secondary)] transition-colors hover:text-[var(--color-coral)] disabled:opacity-40"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="min-w-[20px] text-center text-[13px] font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Increase quantity"
                                disabled={isPending}
                                className="px-2.5 py-1 text-[var(--color-secondary)] transition-colors hover:text-[var(--color-coral)] disabled:opacity-40"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            {/* Price */}
                            <span className="text-[14px] font-semibold text-[var(--color-ink)]">
                              {formatMoney(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                {/* Footer */}
                <div className="border-t border-[var(--color-border)] px-5 py-5">
                  <div className="flex items-center justify-between text-[15px]">
                    <span className="text-[var(--color-secondary)]">Subtotal</span>
                    <span className="font-bold text-[var(--color-ink)]">
                      {formatMoney(cart!.subtotal)}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-[var(--color-secondary)]">
                    Shipping &amp; taxes calculated at checkout
                  </p>

                  <CheckoutButton href={cart!.checkoutUrl} disabled={isPending} className="mt-4" />
                  <button
                    onClick={closeCart}
                    className="mt-2 w-full text-center text-[13px] text-[var(--color-secondary)] underline underline-offset-2 hover:text-[var(--color-coral)]"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
