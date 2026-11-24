"use client"

import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LineAttributes } from "@/components/features/LineAttributes"
import { CheckoutButton } from "@/components/features/CheckoutButton"
import { useCartStore } from "@/store/cart"
import { formatMoney } from "@/lib/utils"

export default function CartPage() {
  const { cart, loaded, removeItem, updateQuantity, isPending, error, retry } = useCartStore()

  // The saved cart is loaded by the cart drawer in the root layout; wait for it instead of flashing "empty".
  if (!loaded) return null

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-32 text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-[var(--color-secondary)]" />
        <h1 className="text-[22px] font-black text-[var(--color-ink)]">Your cart is empty</h1>
        <p className="mt-2 text-[14px] text-[var(--color-secondary)]">
          Looks like you haven&apos;t added anything yet.
        </p>
        {error && (
          <div role="alert" className="mt-4 flex items-center gap-3 text-[13px] text-red-700">
            <span>{error}</span>
            {retry && (
              <button
                onClick={() => void retry()}
                disabled={isPending}
                className="focus-ring rounded-full border border-red-300 px-3 py-1 font-semibold hover:bg-red-50 disabled:opacity-40"
              >
                Retry
              </button>
            )}
          </div>
        )}
        <Link
          href="/shop"
          className="focus-ring mt-6 rounded-full bg-[var(--color-coral)] px-6 py-2.5 text-[14px] font-bold text-[var(--color-ink)] hover:bg-[var(--color-coral-dark)]"
        >
          Browse the Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/shop">
            <ArrowLeft className="mr-1 h-4 w-4" /> Continue Shopping
          </Link>
        </Button>
        <h1 className="text-[24px] font-black text-[var(--color-ink)]">Shopping Cart</h1>
      </div>

      {error && (
        <div role="alert" className="mb-6 flex items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3">
          <p className="text-[13px] text-red-700">{error}</p>
          {retry && (
            <button
              onClick={() => void retry()}
              disabled={isPending}
              className="focus-ring flex-shrink-0 rounded-full border border-red-300 px-3 py-1 text-[12px] font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <ul className="space-y-6">
            {cart.lines.map((item) => {
              return (
                <li key={item.id} className="flex gap-5">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--color-topbar)]">
                    {item.image ? (
                      // Decorative: the product name is right beside it
                      <Image src={item.image.url} alt="" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl" aria-hidden>🐝</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold text-[var(--color-ink)]">{item.title}</p>
                        {item.variantTitle !== "Default Title" && (
                          <p className="text-[12px] text-[var(--color-secondary)]">{item.variantTitle}</p>
                        )}
                        <LineAttributes attributes={item.attributes} />
                      </div>
                      <p className="font-semibold text-[var(--color-ink)]">
                        {formatMoney(item.totalPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-full border border-[var(--color-border)]">
                        <button
                          disabled={isPending}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="focus-ring px-3 py-1.5 text-[var(--color-secondary)] hover:text-[var(--color-coral-ink)] disabled:opacity-40"
                          aria-label={`Decrease quantity of ${item.title}`}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-[13px] font-semibold">{item.quantity}</span>
                        <button
                          disabled={isPending}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="focus-ring px-3 py-1.5 text-[var(--color-secondary)] hover:text-[var(--color-coral-ink)] disabled:opacity-40"
                          aria-label={`Increase quantity of ${item.title}`}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        disabled={isPending}
                        onClick={() => removeItem(item.id)}
                        className="focus-ring p-1.5 text-[var(--color-secondary)] hover:text-red-700 disabled:opacity-40"
                        aria-label={`Remove ${item.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Summary */}
        <div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
            <h2 className="mb-4 text-[16px] font-black text-[var(--color-ink)]">Order Summary</h2>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[var(--color-secondary)]">Subtotal</span>
                <span className="font-semibold">{formatMoney(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-secondary)]">Shipping</span>
                <span className="text-[var(--color-secondary)]">Calculated at checkout</span>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-[15px] font-bold">
              <span>Estimated Total</span>
              <span>{formatMoney(cart.total)}</span>
            </div>
            <CheckoutButton href={cart.checkoutUrl} disabled={isPending} className="mt-5" />
            <p className="mt-2 text-center text-[11px] text-[var(--color-secondary)]">
              Secure checkout powered by Shopify
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
