/** Base class so callers can `instanceof ShopifyError` to catch anything from this layer. */
export class ShopifyError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = new.target.name
  }
}

/** A required env var is missing or malformed. Messages name variables, never values. */
export class ShopifyConfigError extends ShopifyError {}

/** The Storefront API request failed (network, HTTP status, or GraphQL errors). */
export class ShopifyApiError extends ShopifyError {
  readonly status: number | undefined
  readonly operation: string

  constructor(operation: string, message: string, status?: number, cause?: unknown) {
    super(`Shopify ${operation} failed: ${message}`, { cause })
    this.operation = operation
    this.status = status
  }
}
