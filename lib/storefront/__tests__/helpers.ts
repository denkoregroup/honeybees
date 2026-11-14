import { vi } from "vitest"
import type {
  RawCollection,
  RawConnection,
  RawProduct,
  RawProductSummary,
  RawVariant,
} from "../normalize"

// Obviously fake values. TOKEN is also what the "never logged" assertions search for.
export const STORE_DOMAIN = "test-store.myshopify.com"
export const TOKEN = "fake-token-should-never-appear"

type EnvName =
  | "SHOPIFY_STORE_DOMAIN"
  | "SHOPIFY_STOREFRONT_ACCESS_TOKEN"
  | "SHOPIFY_STOREFRONT_API_VERSION"
  | "SHOPIFY_STOREFRONT_TOKEN_TYPE"

/** Valid config with every optional variable unset. Pass overrides; `undefined` unsets a variable. */
export function stubShopifyEnv(overrides: Partial<Record<EnvName, string | undefined>> = {}) {
  const env: Record<EnvName, string | undefined> = {
    SHOPIFY_STORE_DOMAIN: STORE_DOMAIN,
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: TOKEN,
    SHOPIFY_STOREFRONT_API_VERSION: undefined,
    SHOPIFY_STOREFRONT_TOKEN_TYPE: undefined,
    ...overrides,
  }
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value)
}

export interface SentRequest {
  url: string
  query: string
  variables: Record<string, unknown>
  headers: Headers
  next: { revalidate?: number | false; tags?: string[] } | undefined
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })
}

export const gqlData = (data: unknown) => jsonResponse({ data })

/** Replaces global fetch. The handler gets each parsed GraphQL request and returns the Response. */
export function stubFetch(handler: (req: SentRequest) => Response | Promise<Response>) {
  const fetchMock = vi.fn(async (url: unknown, init?: RequestInit & { next?: SentRequest["next"] }) => {
    const { query, variables } = JSON.parse(String(init?.body))
    return handler({
      url: String(url),
      query,
      variables: variables ?? {},
      headers: new Headers(init?.headers),
      next: init?.next,
    })
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

/** Every request the mock received, parsed. */
export function sentRequests(fetchMock: ReturnType<typeof stubFetch>): SentRequest[] {
  return fetchMock.mock.calls.map(([url, init]) => {
    const { query, variables } = JSON.parse(String(init?.body))
    return {
      url: String(url),
      query,
      variables: variables ?? {},
      headers: new Headers(init?.headers),
      next: init?.next,
    }
  })
}

// ---- Raw (GraphQL-shaped) fixtures ----

const money = (amount: string) => ({ amount, currencyCode: "USD" })

export const rawImage = (overrides: Partial<NonNullable<RawVariant["image"]>> = {}) => ({
  url: "https://cdn.example.com/image.png",
  altText: "An image" as string | null,
  width: 800 as number | null,
  height: 600 as number | null,
  ...overrides,
})

export function rawVariant(i = 0, overrides: Partial<RawVariant> = {}): RawVariant {
  return {
    id: `gid://shopify/ProductVariant/${i}`,
    title: `Variant ${i}`,
    availableForSale: true,
    price: money("24.99"),
    compareAtPrice: null,
    selectedOptions: [{ name: "Size", value: `S${i}` }],
    image: null,
    ...overrides,
  }
}

export function rawSummary(overrides: Partial<RawProductSummary> = {}): RawProductSummary {
  return {
    id: "gid://shopify/Product/1",
    title: "Bee Kind Tumbler",
    handle: "bee-kind-tumbler",
    tags: ["drinkware"],
    availableForSale: true,
    featuredImage: rawImage(),
    priceRange: { minVariantPrice: money("24.99"), maxVariantPrice: money("29.99") },
    compareAtPriceRange: { minVariantPrice: money("0.0"), maxVariantPrice: money("0.0") },
    ...overrides,
  }
}

export function rawProduct(
  overrides: Partial<Omit<RawProduct, "variants">> = {},
  variants: RawVariant[] = [rawVariant(0)]
): Omit<RawProduct, "variants"> & { variants: RawConnection<RawVariant> } {
  return {
    ...rawSummary(),
    description: "A tumbler",
    descriptionHtml: "<p>A tumbler</p>",
    images: { nodes: [rawImage()] },
    options: [{ name: "Size", optionValues: [{ name: "20oz" }, { name: "30oz" }] }],
    variants: { nodes: variants, pageInfo: { hasNextPage: false, endCursor: null } },
    collections: { nodes: [{ id: "gid://shopify/Collection/1", title: "Drinkware", handle: "drinkware" }] },
    ...overrides,
  }
}

export function rawCollection(overrides: Partial<RawCollection> = {}): RawCollection {
  return {
    id: "gid://shopify/Collection/1",
    title: "Drinkware",
    handle: "drinkware",
    description: "Tumblers and mugs",
    descriptionHtml: "<p>Tumblers and mugs</p>",
    image: null,
    ...overrides,
  }
}
