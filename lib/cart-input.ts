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

/** The cart line attribute that carries a color the customer typed in ("Other" colors). */
export const REQUESTED_COLOR_KEY = "Requested color"
export const MAX_REQUESTED_COLOR = 40

/** Drops leading spaces and cuts to the limit, for the text box as the customer types. */
export function typedColor(value: string): string {
  return value.replace(/^\s+/, "").slice(0, MAX_REQUESTED_COLOR)
}

/** The color to send: trimmed, or "" when nothing but spaces was typed. */
export function trimmedColor(value: string): string {
  return typedColor(value).trim()
}

/**
 * A requested color the browser sent: 1 to 40 characters once trimmed, no control characters (no
 * line breaks or tabs). Returns the trimmed text, or null when it isn't acceptable.
 */
export function parseRequestedColor(value: unknown): string | null {
  if (typeof value !== "string") return null
  const text = value.trim()
  return text.length >= 1 && text.length <= MAX_REQUESTED_COLOR && !/[\u0000-\u001f\u007f]/.test(text) ? text : null
}
