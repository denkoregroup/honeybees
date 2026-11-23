/** The homepage loads 12 featured products for the desktop carousel; phones show the first 4. */
export const MOBILE_FEATURED_COUNT = 4

export function mobileFeatured<T>(products: T[]): T[] {
  return products.slice(0, MOBILE_FEATURED_COUNT)
}
