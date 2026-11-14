"use client"

// Shown when a page fails to load, for example when Shopify can't be reached. The failure itself is
// logged server-side by lib/storefront; nothing from the error is shown to the visitor.
export default function Error({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <span className="text-5xl">🐝</span>
      <h1 className="mt-4 text-[22px] font-black text-[var(--color-ink)]">We couldn&apos;t load this page</h1>
      <p className="mt-2 text-[14px] text-[var(--color-secondary)]">
        Our shop is having trouble right now. Please try again in a moment.
      </p>
      <button
        onClick={() => unstable_retry()}
        className="mt-6 rounded-full bg-[var(--color-coral)] px-6 py-2.5 text-[13px] font-bold text-white hover:bg-[var(--color-coral-dark)]"
      >
        Try again
      </button>
    </div>
  )
}
