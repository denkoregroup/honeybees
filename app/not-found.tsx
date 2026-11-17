import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <span className="text-5xl">🐝</span>
      <h1 className="mt-4 text-[22px] font-black text-[var(--color-ink)]">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-[14px] text-[var(--color-secondary)]">
        It may have moved or never existed. Let&apos;s get you back to the hive.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="rounded-full bg-[var(--color-coral)] px-6 py-2.5 text-[13px] font-bold text-white hover:bg-[var(--color-coral-dark)]"
        >
          Shop All
        </Link>
        <Link
          href="/collections"
          className="rounded-full border border-[var(--color-border)] bg-white px-6 py-2.5 text-[13px] font-bold text-[var(--color-ink)] hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
        >
          Collections
        </Link>
      </div>
    </div>
  )
}
