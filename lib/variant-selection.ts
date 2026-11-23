import type { Money, Product, ProductOption, Variant } from "@/lib/storefront/types"

// Availability is Shopify's `availableForSale`, which already accounts for "continue selling when out
// of stock" (these products are made to order). Inventory counts are never used.

/** What the shopper has chosen so far: option name -> value. Options not chosen yet are absent. */
export type Selection = Record<string, string>

type UrlParams = Record<string, string | string[] | undefined>

const optionValue = (variant: Variant, name: string) =>
  variant.selectedOptions.find((o) => o.name === name)?.value

const matches = (variant: Variant, selection: Selection) =>
  Object.entries(selection).every(([name, value]) => optionValue(variant, name) === value)

const sameText = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

/**
 * The starting selection. Nothing is preselected, except an option with exactly one value (there is
 * nothing to choose) and any option the URL names explicitly (`?Size=Large&Color=Sand`). URL names and
 * values match case-insensitively, and a value the product doesn't have is ignored.
 */
export function initialSelection(options: ProductOption[], params: UrlParams = {}): Selection {
  const selection: Selection = {}
  for (const option of options) {
    if (option.values.length === 1) {
      selection[option.name] = option.values[0]
      continue
    }
    const key = Object.keys(params).find((k) => sameText(k, option.name))
    const raw = key === undefined ? undefined : [params[key]].flat()[0]
    const value = raw === undefined ? undefined : option.values.find((v) => sameText(v, raw))
    if (value !== undefined) selection[option.name] = value
  }
  return selection
}

/** Names of the options that still have no value, in the product's option order. */
export function missingOptions(options: ProductOption[], selection: Selection): string[] {
  return options.filter((o) => selection[o.name] === undefined).map((o) => o.name)
}

/** The variant for a complete selection (every option has a value), otherwise null. */
export function resolveVariant(variants: Variant[], options: ProductOption[], selection: Selection): Variant | null {
  if (missingOptions(options, selection).length > 0) return null
  return variants.find((v) => matches(v, selection)) ?? null
}

/**
 * True when some purchasable variant has this value together with the other options already chosen.
 * The option's own current choice is ignored, so the shopper can always switch it. With nothing
 * selected, this is just "does any purchasable variant have the value".
 */
export function isValueAvailable(variants: Variant[], name: string, value: string, selection: Selection = {}): boolean {
  const others = Object.fromEntries(Object.entries(selection).filter(([n]) => n !== name))
  return variants.some((v) => v.availableForSale && optionValue(v, name) === value && matches(v, others))
}

/** The lowest price among purchasable variants that fit what is chosen so far (all of them when nothing is). */
export function fromPrice(product: Pick<Product, "variants" | "priceRange">, selection: Selection): Money {
  const available = product.variants.filter((v) => v.availableForSale)
  const fitting = available.filter((v) => matches(v, selection))
  const pool = fitting.length > 0 ? fitting : available
  if (pool.length === 0) return product.priceRange.min
  return pool.reduce((low, v) => (Number(v.price.amount) < Number(low.amount) ? v.price : low), pool[0].price)
}

/** "Select a size", "Select size and color", "Select size, style and color". */
export function selectLabel(names: string[]): string {
  const lower = names.map((n) => n.toLowerCase())
  if (lower.length === 1) return `Select ${/^[aeiou]/.test(lower[0]) ? "an" : "a"} ${lower[0]}`
  return `Select ${lower.slice(0, -1).join(", ")} and ${lower[lower.length - 1]}`
}

export interface PurchaseState {
  /** The resolved variant, or null until every option has a value (or when that combination doesn't exist). */
  variant: Variant | null
  /** True while the price should read "From $X". */
  showFrom: boolean
  price: Money
  canAdd: boolean
  /** Add to cart button text. */
  label: string
  /** The line under the button, for screen readers and sighted shoppers alike. Empty when ready. */
  helper: string
}

export function purchaseState(
  product: Pick<Product, "options" | "variants" | "priceRange">,
  selection: Selection
): PurchaseState {
  const missing = missingOptions(product.options, selection)
  if (missing.length > 0) {
    const label = selectLabel(missing)
    return {
      variant: null,
      showFrom: true,
      price: fromPrice(product, selection),
      canAdd: false,
      label,
      helper: `${label} to add this to your cart.`,
    }
  }
  const variant = resolveVariant(product.variants, product.options, selection)
  if (!variant || !variant.availableForSale) {
    return {
      variant,
      showFrom: false,
      price: variant?.price ?? fromPrice(product, {}),
      canAdd: false,
      label: "Unavailable",
      helper: "That combination is sold out. Try a different option.",
    }
  }
  return { variant, showFrom: false, price: variant.price, canAdd: true, label: "Add to cart", helper: "" }
}

/** Options that need a picker. A "Title: Default Title" product has one value, so it gets none. */
export function pickerOptions(product: Pick<Product, "options">) {
  return product.options.filter((o) => o.values.length > 1)
}
