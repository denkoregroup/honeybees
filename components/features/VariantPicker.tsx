"use client"

import type { Product, Variant } from "@/lib/storefront/types"
import { isValueAvailable, pickerOptions, selectValue } from "@/lib/variant-selection"

interface VariantPickerProps {
  product: Pick<Product, "options" | "variants">
  selected: Variant | null
  onSelect: (variant: Variant | null) => void
}

/** One row of buttons per option that has a choice (Size, Style, Color...). Renders nothing for default-title products. */
export function VariantPicker({ product, selected, onSelect }: VariantPickerProps) {
  return (
    <>
      {pickerOptions(product).map((option) => {
        const chosen = selected?.selectedOptions.find((o) => o.name === option.name)?.value

        return (
          <div key={option.name}>
            <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[var(--color-ink)]">
              {option.name}:{" "}
              <span className="font-normal normal-case text-[var(--color-secondary)]">
                {chosen ?? "Select one"}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const available = isValueAvailable(product.variants, option.name, value)
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onSelect(selectValue(product.variants, selected, option.name, value))}
                    disabled={!available}
                    className={[
                      "rounded-full px-4 py-1.5 text-[13px] font-bold transition-all",
                      chosen === value
                        ? "bg-[var(--color-ink)] text-white"
                        : "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[var(--color-ink)]",
                      !available ? "line-through opacity-40 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}
