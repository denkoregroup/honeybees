"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"

interface CheckoutButtonProps {
  /** Shopify's hosted checkout URL for the current cart. */
  href: string
  /** True while a cart change is in flight, so checkout never opens on a stale cart. */
  disabled?: boolean
  className?: string
}

/**
 * The cart's main call to action. Checkout is a plain navigation to Shopify, so after the first tap
 * the button goes into a loading state and ignores further taps: a double tap can't open it twice.
 * It resets if the shopper comes back with the browser's Back button (the page is restored from cache).
 */
export function CheckoutButton({ href, disabled = false, className = "" }: CheckoutButtonProps) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      if (event.persisted) setLeaving(false)
    }
    window.addEventListener("pageshow", reset)
    return () => window.removeEventListener("pageshow", reset)
  }, [])

  const blocked = disabled || leaving

  return (
    <>
      <a
        href={href}
        aria-disabled={blocked}
        onClick={(event) => {
          if (blocked) {
            event.preventDefault()
            return
          }
          setLeaving(true)
        }}
        className={`btn-cta w-full ${className}`}
      >
        {leaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Opening checkout…
          </>
        ) : (
          <>
            Checkout
            <ArrowRight className="h-4 w-4" aria-hidden />
          </>
        )}
      </a>
      <span role="status" className="sr-only">
        {leaving ? "Opening checkout" : ""}
      </span>
    </>
  )
}
