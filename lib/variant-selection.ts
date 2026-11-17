import type { Product, Variant } from "@/lib/storefront/types"

// Availability is Shopify's `availableForSale`, which already accounts for "continue selling when out
// of stock" (these products are made to order). Inventory counts are never used.

/** The variant shown first: the first one that can be bought. */
export function initialVariant(variants: Variant[]): Variant | null {
  return variants.find((v) => v.availableForSale) ?? null
}

const optionValue = (variant: Variant, name: string) =>
  variant.selectedOptions.find((o) => o.name === name)?.value

/** True when some purchasable variant has this option value. */
export function isValueAvailable(variants: Variant[], name: string, value: string): boolean {
  return variants.some((v) => v.availableForSale && optionValue(v, name) === value)
}

/**
 * The variant to select after the shopper picks `value` for option `name`. Keeps the other chosen
 * options when that combination can be bought, otherwise switches to the first purchasable variant
 * with the picked value, so a shopper can never get stuck on a combination that does not exist.
 */
export function selectValue(
  variants: Variant[],
  current: Variant | null,
  name: string,
  value: string
): Variant | null {
  const candidates = variants.filter((v) => v.availableForSale && optionValue(v, name) === value)
  const keepsOthers = (v: Variant) =>
    current !== null &&
    current.selectedOptions.every((o) => o.name === name || optionValue(v, o.name) === o.value)
  return candidates.find(keepsOthers) ?? candidates[0] ?? null
}

/** Options that need a picker. A "Title: Default Title" product has one value, so it gets none. */
export function pickerOptions(product: Pick<Product, "options">) {
  return product.options.filter((o) => o.values.length > 1)
}
