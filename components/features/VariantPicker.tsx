"use client"

import { Check } from "lucide-react"
import type { Product } from "@/lib/storefront/types"
import { MAX_REQUESTED_COLOR, typedColor, trimmedColor } from "@/lib/cart-input"
import {
  OTHER_COLOR_LABEL,
  isOtherColor,
  isValueAvailable,
  orderedValues,
  pickerOptions,
  type Selection,
} from "@/lib/variant-selection"

interface VariantPickerProps {
  product: Pick<Product, "options" | "variants">
  selection: Selection
  onSelect: (name: string, value: string) => void
  /** What the customer typed for an "Other" color. Only used while "Other" is chosen. */
  requestedColor: string
  onRequestedColorChange: (value: string) => void
}

/**
 * One row of pills per option that has a choice (Size, Style, Color...). Nothing starts selected.
 * The selected pill is filled and carries a check, so it doesn't rely on color alone. A value no
 * purchasable variant has, given the other chosen options, is struck through and disabled.
 */
export function VariantPicker({ product, selection, onSelect, requestedColor, onRequestedColorChange }: VariantPickerProps) {
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
              {orderedValues(option).map((value) => {
                // "Other" is made to order, so it is never shown as sold out
                const available = isOtherColor(option.name, value) || isValueAvailable(product.variants, option.name, value, selection)
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
                    {isOtherColor(option.name, value) ? OTHER_COLOR_LABEL : value}
                  </button>
                )
              })}
            </div>
            {isOtherColor(option.name, chosen) && (
              <div className="mt-3">
                <label htmlFor="requested-color" className="mb-1.5 block text-[13px] font-bold text-[var(--color-ink)]">
                  Which color would you like?
                </label>
                <input
                  id="requested-color"
                  type="text"
                  value={requestedColor}
                  onChange={(event) => onRequestedColorChange(typedColor(event.target.value))}
                  onBlur={() => onRequestedColorChange(trimmedColor(requestedColor))}
                  maxLength={MAX_REQUESTED_COLOR}
                  placeholder="e.g. Forest green"
                  autoComplete="off"
                  aria-describedby="requested-color-note"
                  className="focus-ring min-h-[48px] w-full rounded-xl border-2 border-[var(--color-ink)] bg-white px-4 text-[16px] text-[var(--color-ink)] placeholder:text-[var(--color-secondary)]"
                />
                <p id="requested-color-note" className="mt-1.5 text-[13px] text-[var(--color-secondary)]">
                  We&apos;ll confirm your color within 1 business day.
                </p>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
