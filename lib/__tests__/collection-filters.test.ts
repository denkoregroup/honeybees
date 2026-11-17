import { describe, expect, it } from "vitest"
import { collectionFilterOptions } from "../collection-filters"

const col = (handle: string, title: string) => ({ id: `gid://c/${handle}`, handle, title })

describe("collectionFilterOptions", () => {
  it("is just All when no product is in a collection", () => {
    expect(collectionFilterOptions([{ collections: [] }])).toEqual([{ label: "All", value: "all" }])
  })

  it("lists each collection once, labelled with its title, in first-seen order", () => {
    const options = collectionFilterOptions([
      { collections: [col("apparel", "Apparel"), col("mama", "Mama")] },
      { collections: [col("drinkware", "Drinkware"), col("apparel", "Apparel")] },
    ])
    expect(options).toEqual([
      { label: "All", value: "all" },
      { label: "Apparel", value: "apparel" },
      { label: "Mama", value: "mama" },
      { label: "Drinkware", value: "drinkware" },
    ])
  })
})
