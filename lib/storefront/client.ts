import "server-only"

import { createStorefrontApiClient, type StorefrontApiClient } from "@shopify/storefront-api-client"
import { REVALIDATE_SECONDS } from "./cache"
import { ShopifyApiError, ShopifyConfigError } from "./errors"

/** Latest stable Storefront API version at time of writing; override with SHOPIFY_STOREFRONT_API_VERSION. */
const DEFAULT_API_VERSION = "2026-10"

// No Shopify-Storefront-Buyer-IP header is sent: it would require reading request headers and force
// dynamic rendering of otherwise cached catalog pages.

// Per-call cache tags travel to the fetch wrapper in this header, which is stripped before sending.
const TAGS_HEADER = "x-storefront-cache-tags"

let client: StorefrontApiClient | null = null

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new ShopifyConfigError(`Missing environment variable ${name}`)
  return value
}

function getClient(): StorefrontApiClient {
  if (client) return client

  const storeDomain = requireEnv("SHOPIFY_STORE_DOMAIN")
  if (!/^[a-z0-9.-]+$/i.test(storeDomain)) {
    throw new ShopifyConfigError(
      "SHOPIFY_STORE_DOMAIN must be a bare hostname (no protocol, path or port), e.g. your-store.myshopify.com"
    )
  }

  client = createStorefrontApiClient({
    storeDomain,
    apiVersion: process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || DEFAULT_API_VERSION,
    // Server-side requests use the Headless channel's *private* token (Shopify-Storefront-Private-Token).
    privateAccessToken: requireEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN"),
    customFetchApi: (url, init) => {
      const headers = new Headers(init?.headers)
      const tags = headers.get(TAGS_HEADER)?.split(",").filter(Boolean) ?? []
      headers.delete(TAGS_HEADER)
      return fetch(url, { ...init, headers, next: { revalidate: REVALIDATE_SECONDS, tags } })
    },
  })
  return client
}

/**
 * Run a Storefront API operation. Throws ShopifyConfigError / ShopifyApiError; failures are logged
 * server-side with operation name and status only (never headers, tokens or response objects).
 */
export async function storefrontRequest<T>(
  operation: string,
  query: string,
  variables: Record<string, unknown>,
  tags: string[]
): Promise<T> {
  const { data, errors } = await getClient().request<T>(query, {
    variables,
    headers: { [TAGS_HEADER]: tags.join(",") },
  })

  if (errors || !data) {
    const status = errors?.networkStatusCode
    const detail = errors?.graphQLErrors?.length
      ? errors.graphQLErrors.map((e: { message?: string }) => e.message).join("; ")
      : errors?.message ?? "empty response"
    console.error(`[shopify] ${operation} failed`, { status, detail })
    // `errors` is the Storefront client's error object (message, status, graphQLErrors); it holds no request headers.
    throw new ShopifyApiError(operation, detail, status, errors)
  }
  return data
}
