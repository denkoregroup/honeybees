// Handles must exist in Shopify and have products today, or the tile 404s / lands on an empty page.
// Add or remove a tile here only after checking the collection in the store.
// Kept out of CategoryGrid (a client component) so the server can read it when fetching the tiles.
export const CATEGORIES = [
  { name: "APPAREL",               handle: "apparel-1" },
  { name: "TURTLEY AWESOME MERCH", handle: "turtley-awesome-merch" },
  { name: "TURTLEY COASTERS",      handle: "turtley-coasters" },
  { name: "TURTLEY DECALS",        handle: "turtley-decals" },
  { name: "TURTLEY KEYCHAINS",     handle: "turtley-keychains" },
]
