"use client"

import Link from "next/link"

// Shown in place of a page that fails to load, for example when Shopify can't be reached. It renders
// inside the root layout, so the header and footer stay. The failure itself is logged server-side by
// lib/storefront; nothing from the error is shown to the visitor.
export default function Error({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <span className="text-5xl" aria-hidden="true">🐝</span>
      <h1 className="mt-4 text-[22px] font-black text-[var(--color-ink)]">We&apos;ll be back soon</h1>
      <p className="mt-2 max-w-md text-[14px] text-[var(--color-secondary)]">
        Our shop isn&apos;t loading right now. Please try again, or come back a little later.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="focus-ring mt-6 rounded-full bg-[var(--color-coral)] px-6 py-2.5 text-[13px] font-bold text-white hover:bg-[var(--color-coral-dark)]"
      >
        Try again
      </button>
      <p className="mt-6 text-[13px] text-[var(--color-secondary)]">
        Have a question about an order?{" "}
        <Link href="/contact" className="focus-ring font-bold text-[var(--color-coral-ink)] underline">
          Get in touch
        </Link>
      </p>
    </div>
  )
}
