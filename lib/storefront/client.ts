import "server-only"

import { headers } from "next/headers"
import { createStorefrontApiClient, type StorefrontApiClient } from "@shopify/storefront-api-client"
import { REVALIDATE_SECONDS } from "./cache"
import { ShopifyApiError, ShopifyConfigError } from "./errors"

/** Latest stable Storefront API version at time of writing; override with SHOPIFY_STOREFRONT_API_VERSION. */
const DEFAULT_API_VERSION = "2026-10"

// Catalog reads never send Shopify-Storefront-Buyer-IP: it would require reading request headers and
// force dynamic rendering of otherwise cached catalog pages. Cart requests send it with a private token.

// Per-call cache tags travel to the fetch wrapper in this header, which is stripped before sending.
const TAGS_HEADER = "x-storefront-cache-tags"

type FetchApi = NonNullable<Parameters<typeof createStorefrontApiClient>[0]["customFetchApi"]>

let catalogClient: StorefrontApiClient | null = null
let cartClient: StorefrontApiClient | null = null

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new ShopifyConfigError(`Missing environment variable ${name}`)
  return value
}

/** "private" (default) or "public", per SHOPIFY_STOREFRONT_TOKEN_TYPE; the token itself is always SHOPIFY_STOREFRONT_ACCESS_TOKEN. */
function tokenType(): "private" | "public" {
  const type = process.env.SHOPIFY_STOREFRONT_TOKEN_TYPE?.trim() || "private"
  if (type !== "private" && type !== "public") {
    throw new ShopifyConfigError('SHOPIFY_STOREFRONT_TOKEN_TYPE must be "private" or "public"')
  }
  return type
}

function tokenOptions(): { privateAccessToken: string } | { publicAccessToken: string } {
  const type = tokenType()
  const token = requireEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN")
  return type === "public" ? { publicAccessToken: token } : { privateAccessToken: token }
}

function createClient(customFetchApi: FetchApi): StorefrontApiClient {
  const storeDomain = requireEnv("SHOPIFY_STORE_DOMAIN")
  if (!/^[a-z0-9.-]+$/i.test(storeDomain)) {
    throw new ShopifyConfigError(
      "SHOPIFY_STORE_DOMAIN must be a bare hostname (no protocol, path or port), e.g. your-store.myshopify.com"
    )
  }

  return createStorefrontApiClient({
    storeDomain,
    apiVersion: process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || DEFAULT_API_VERSION,
    // Private token by default (Shopify-Storefront-Private-Token); see tokenOptions().
    ...tokenOptions(),
    customFetchApi,
  })
}

/** Catalog reads: cached for REVALIDATE_SECONDS and tagged. */
function getClient(): StorefrontApiClient {
  catalogClient ??= createClient((url, init) => {
    const headers = new Headers(init?.headers)
    const tags = headers.get(TAGS_HEADER)?.split(",").filter(Boolean) ?? []
    headers.delete(TAGS_HEADER)
    return fetch(url, { ...init, headers, next: { revalidate: REVALIDATE_SECONDS, tags } })
  })
  return catalogClient
}

/** Cart calls: never cached, no tags. */
function getCartClient(): StorefrontApiClient {
  cartClient ??= createClient((url, init) => fetch(url, { ...init, cache: "no-store" }))
  return cartClient
}

async function execute<T>(
  storefront: StorefrontApiClient,
  operation: string,
  query: string,
  variables: Record<string, unknown>,
  requestHeaders: Record<string, string>
): Promise<T> {
  const { data, errors } = await storefront.request<T>(query, { variables, headers: requestHeaders })

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
  return execute<T>(getClient(), operation, query, variables, { [TAGS_HEADER]: tags.join(",") })
}

/**
 * Run a cart operation. Never cached. With a private token the buyer's IP (from the incoming
 * request) is sent in Shopify-Storefront-Buyer-IP; with a public token Shopify doesn't need it.
 */
export async function cartRequest<T>(
  operation: string,
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const requestHeaders: Record<string, string> = {}
  if (tokenType() === "private") {
    const buyerIp = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim()
    if (buyerIp) requestHeaders["Shopify-Storefront-Buyer-IP"] = buyerIp
  }
  return execute<T>(getCartClient(), operation, query, variables, requestHeaders)
}
