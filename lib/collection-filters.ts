import type { ProductSummary } from "@/lib/storefront/types"

export interface FilterOption {
  label: string
  value: string
}

/** "All" plus one option per collection that at least one of the products belongs to, in first-seen order. */
export function collectionFilterOptions(products: Pick<ProductSummary, "collections">[]): FilterOption[] {
  const titles = new Map<string, string>()
  for (const product of products) {
    for (const { handle, title } of product.collections) titles.set(handle, title)
  }
  return [{ label: "All", value: "all" }, ...[...titles].map(([value, label]) => ({ label, value }))]
}
