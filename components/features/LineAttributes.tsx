import type { CartLine } from "@/lib/storefront/types"

/**
 * Extra details on a cart line, such as "Requested color: Forest green". Attributes whose key starts
 * with an underscore are Shopify's convention for hidden ones and are not shown. The text goes through
 * React, so it is always escaped.
 */
export function LineAttributes({ attributes }: { attributes: CartLine["attributes"] }) {
  const visible = attributes.filter((a) => !a.key.startsWith("_") && a.value !== "")
  if (visible.length === 0) return null
  return (
    <ul className="mt-0.5 space-y-0.5">
      {visible.map((a) => (
        <li key={a.key} className="break-words text-[12px] text-[var(--color-secondary)]">
          {a.key}: {a.value}
        </li>
      ))}
    </ul>
  )
}
