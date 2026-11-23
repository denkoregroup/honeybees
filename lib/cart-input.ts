// Boundary checks for cart server actions: the browser can send anything, so inputs are validated
// on the server before they reach Shopify. Each returns the checked value or null.

export const MAX_QUANTITY = 99

export function parseVariantId(value: unknown): string | null {
  return typeof value === "string" && /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(value) ? value : null
}

export function parseLineId(value: unknown): string | null {
  return typeof value === "string" && /^gid:\/\/shopify\/CartLine\/\S+$/.test(value) ? value : null
}

/** A cart id as Shopify issues it (including its `?key=` secret); used to check the cookie. */
export function parseCartId(value: unknown): string | null {
  return typeof value === "string" && /^gid:\/\/shopify\/Cart\/\S+$/.test(value) ? value : null
}

/** An integer from `min` to 99. Adding needs at least 1; updating allows 0, which removes the line. */
export function parseQuantity(value: unknown, min: 0 | 1): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= MAX_QUANTITY ? value : null
}
