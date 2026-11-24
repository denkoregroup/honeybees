"use client"

interface FilterOption {
  label: string
  value: string
}

interface ShopFiltersProps {
  options: FilterOption[]
  active: string
  onChange: (value: string) => void
}

export function ShopFilters({ options, active, onChange }: ShopFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ label, value }) => {
        const isActive = active === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(value)}
            className={[
              "focus-ring rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-wide transition-all",
              isActive
                ? "bg-[var(--color-coral)] text-[var(--color-ink)] shadow-sm"
                : "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[var(--color-coral-ink)] hover:text-[var(--color-coral-ink)]",
            ].join(" ")}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
