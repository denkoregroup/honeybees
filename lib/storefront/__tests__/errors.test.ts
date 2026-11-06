import { describe, expect, it } from "vitest"
import { ShopifyApiError, ShopifyConfigError, ShopifyError } from "../errors"

describe("ShopifyApiError", () => {
  it("carries operation, status and cause", () => {
    const cause = { message: "boom", networkStatusCode: 503 }
    const err = new ShopifyApiError("getProducts", "Service Unavailable", 503, cause)
    expect(err.operation).toBe("getProducts")
    expect(err.status).toBe(503)
    expect(err.cause).toBe(cause)
    expect(err.message).toBe("Shopify getProducts failed: Service Unavailable")
  })

  it("leaves status and cause undefined when not given", () => {
    const err = new ShopifyApiError("getCollections", "fetch failed")
    expect(err.status).toBeUndefined()
    expect(err.cause).toBeUndefined()
  })

  it("is an Error, a ShopifyError and named after its class", () => {
    const err = new ShopifyApiError("op", "msg")
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(ShopifyError)
    expect(err.name).toBe("ShopifyApiError")
  })
})

describe("ShopifyConfigError", () => {
  it("is a ShopifyError named after its class, and not an API error", () => {
    const err = new ShopifyConfigError("Missing environment variable SHOPIFY_STORE_DOMAIN")
    expect(err).toBeInstanceOf(ShopifyError)
    expect(err).not.toBeInstanceOf(ShopifyApiError)
    expect(err.name).toBe("ShopifyConfigError")
  })
})
