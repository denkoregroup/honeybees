import { describe, expect, it } from "vitest"
import { groupCollections } from "../hierarchy"
import type { CollectionNode } from "../types"

function node(handle: string, overrides: Partial<CollectionNode> = {}): CollectionNode {
  return {
    id: `gid://shopify/Collection/${handle}`,
    title: handle,
    handle,
    description: "",
    descriptionHtml: "",
    image: null,
    parentHandle: null,
    hasProducts: true,
    ...overrides,
  }
}

const handles = (list: CollectionNode[]) => list.map((n) => n.handle)

describe("groupCollections", () => {
  it("puts children under their parent, in order, and the rest in the flat list", () => {
    const tree = groupCollections([
      node("paws-and-claws", { hasProducts: false }),
      node("turtley-apparel", { parentHandle: "paws-and-claws" }),
      node("mama"),
      node("turtley-coasters", { parentHandle: "paws-and-claws" }),
    ])

    expect(tree.groups).toHaveLength(1)
    expect(tree.groups[0].parent.handle).toBe("paws-and-claws")
    expect(handles(tree.groups[0].children)).toEqual(["turtley-apparel", "turtley-coasters"])
    expect(handles(tree.flat)).toEqual(["mama"])
  })

  it("hides children without products, and a parent whose children are all empty", () => {
    const tree = groupCollections([
      node("paws-and-claws", { hasProducts: false }),
      node("turtley-decals", { parentHandle: "paws-and-claws", hasProducts: false }),
      node("turtley-keychains", { parentHandle: "paws-and-claws", hasProducts: false }),
    ])
    expect(tree).toEqual({ groups: [], flat: [] })
  })

  it("hides only the empty children of a group", () => {
    const tree = groupCollections([
      node("paws-and-claws"),
      node("turtley-apparel", { parentHandle: "paws-and-claws" }),
      node("turtley-decals", { parentHandle: "paws-and-claws", hasProducts: false }),
    ])
    expect(handles(tree.groups[0].children)).toEqual(["turtley-apparel"])
  })

  it("lists a parent with no children by itself when it has products, and hides it when it doesn't", () => {
    expect(handles(groupCollections([node("paws-and-claws")]).flat)).toEqual(["paws-and-claws"])
    expect(groupCollections([node("paws-and-claws", { hasProducts: false })])).toEqual({ groups: [], flat: [] })
  })

  it("lists a child whose parent doesn't exist by itself", () => {
    const tree = groupCollections([node("turtley-apparel", { parentHandle: "missing-parent" })])
    expect(tree.groups).toEqual([])
    expect(handles(tree.flat)).toEqual(["turtley-apparel"])
  })

  it("keeps collections without a parent flat and hides the empty ones", () => {
    const tree = groupCollections([node("mama"), node("dads", { hasProducts: false }), node("teacher")])
    expect(tree.groups).toEqual([])
    expect(handles(tree.flat)).toEqual(["mama", "teacher"])
  })

  it("rejects a child that is itself a parent, instead of dropping its children", () => {
    expect(() =>
      groupCollections([
        node("grandparent"),
        node("parent", { parentHandle: "grandparent" }),
        node("child", { parentHandle: "parent" }),
      ])
    ).toThrow(/Only one level of nesting/)
  })

  it("rejects a collection that is its own parent", () => {
    expect(() => groupCollections([node("loop", { parentHandle: "loop" })])).toThrow(/Only one level of nesting/)
  })
})
