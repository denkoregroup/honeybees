import type { PageArgs } from "./types"

const MAX_PAGE_SIZE = 250

export function pageVariables({ first, after }: PageArgs, defaultFirst: number) {
  const size = first ?? defaultFirst
  if (!Number.isInteger(size) || size < 1 || size > MAX_PAGE_SIZE) {
    throw new RangeError(`first must be an integer between 1 and ${MAX_PAGE_SIZE}`)
  }
  return { first: size, after: after ?? null }
}
