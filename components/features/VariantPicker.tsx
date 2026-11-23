"use client"

import { Check } from "lucide-react"
import type { Product } from "@/lib/storefront/types"
import { isValueAvailable, pickerOptions, type Selection } from "@/lib/variant-selection"

interface VariantPickerProps {
  product: Pick<Product, "options" | "variants">
  selection: Selection
  onSelect: (name: string, value: string) => void
}

/**
 * One row of pills per option that has a choice (Size, Style, Color...). Nothing starts selected.
 * The selected pill is filled and carries a check, so it doesn't rely on color alone. A value no
 * purchasable variant has, given the other chosen options, is struck through and disabled.
 */
export function VariantPicker({ product, selection, onSelect }: VariantPickerProps) {
  return (
    <>
      {pickerOptions(product).map((option) => {
        const chosen = selection[option.name]
        const labelId = `option-${option.name.replace(/\W+/g, "-").toLowerCase()}`

        return (
          <div key={option.name} role="group" aria-labelledby={labelId}>
            <p id={labelId} className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[var(--color-ink)]">
              {option.name}:{" "}
              <span className="font-normal normal-case text-[var(--color-secondary)]">{chosen ?? "Select one"}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const available = isValueAvailable(product.variants, option.name, value, selection)
                const isChosen = chosen === value
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isChosen}
                    onClick={() => onSelect(option.name, value)}
                    disabled={!available}
                    className={[
                      "focus-ring inline-flex min-h-[40px] items-center gap-1.5 rounded-full border-2 px-4 py-1.5 text-[13px] transition-colors",
                      isChosen
                        ? "border-[var(--color-ink)] bg-[var(--color-ink)] font-extrabold text-[var(--color-cream)]"
                        : "border-[var(--color-border)] bg-white font-bold text-[var(--color-ink)] hover:border-[var(--color-ink)]",
                      !available ? "cursor-not-allowed line-through opacity-40 hover:border-[var(--color-border)]" : "",
                    ].join(" ")}
                  >
                    {isChosen && <Check className="h-3.5 w-3.5" aria-hidden />}
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
