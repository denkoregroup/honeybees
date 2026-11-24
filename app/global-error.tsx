"use client"

import "./globals.css"

// Shown when the root layout itself fails. It replaces the root layout, so it brings its own <html>,
// <body> and styles, and it must not load anything from Shopify. There is no contact link: every
// other page shares the failing layout. Fonts fall back to the system's (next/font lives in the layout).
export default function GlobalError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[var(--color-cream)] text-[var(--color-ink)]">
        <title>We&apos;ll be back soon | HoneyBee Designs</title>
        <main className="mx-auto flex max-w-7xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <span className="text-5xl" aria-hidden="true">🐝</span>
          <h1 className="mt-4 text-[22px] font-black">HoneyBee Designs will be back soon</h1>
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
        </main>
      </body>
    </html>
  )
}
