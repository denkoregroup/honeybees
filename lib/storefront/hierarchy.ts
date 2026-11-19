import { ShopifyConfigError } from "./errors"
import type { CollectionNode, CollectionTree } from "./types"

/** The one parent collection the site links to directly (nav entry, product line). */
export const PARENT_COLLECTION_HANDLE = "paws-and-claws"

/**
 * Groups children under their parent. Collections without products are hidden everywhere.
 * - A child with products goes under its parent; if the parent doesn't exist, it is listed on its own.
 * - A parent with at least one child that has products becomes a group, even if it has no products itself.
 * - A parent with no such children is listed on its own if it has products, otherwise hidden.
 * Only one level exists: a collection that is both a child and a parent is a data error.
 */
export function groupCollections(nodes: CollectionNode[]): CollectionTree {
  const byHandle = new Map(nodes.map((n) => [n.handle, n]))

  for (const node of nodes) {
    const parent = node.parentHandle ? byHandle.get(node.parentHandle) : undefined
    if (node.parentHandle === node.handle || parent?.parentHandle) {
      throw new ShopifyConfigError(
        `Collection "${node.handle}" has parent "${node.parentHandle}", which is itself a child. Only one level of nesting is supported.`
      )
    }
  }

  const childrenOf = new Map<string, CollectionNode[]>()
  const flat: CollectionNode[] = []

  for (const node of nodes) {
    if (!node.hasProducts || !node.parentHandle) continue
    if (byHandle.has(node.parentHandle)) {
      childrenOf.set(node.parentHandle, [...(childrenOf.get(node.parentHandle) ?? []), node])
    } else {
      flat.push(node)
    }
  }

  const groups: CollectionTree["groups"] = []
  const standalone: CollectionNode[] = []
  for (const node of nodes) {
    if (node.parentHandle) continue
    const children = childrenOf.get(node.handle)
    if (children) groups.push({ parent: node, children })
    else if (node.hasProducts) standalone.push(node)
  }

  return { groups, flat: [...standalone, ...flat] }
}
