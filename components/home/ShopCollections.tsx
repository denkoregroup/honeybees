import Image from "next/image"
import Link from "next/link"
import { SHOP_COLLECTIONS_MAX, type CollectionTile } from "./collection-tiles"

// Static class names so Tailwind can see them. Six tiles keep the old 3-then-6 layout; fewer sit in one
// centered row, each no wider than a tile in the six-up row.
const GRID_COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-3 lg:grid-cols-6",
}
const GAP_PX = 8

export function ShopCollections({ tiles }: { tiles: CollectionTile[] }) {
  if (tiles.length === 0) return null
  const count = Math.min(tiles.length, SHOP_COLLECTIONS_MAX)

  return (
    <section className="hidden md:block" style={{ backgroundColor: "var(--color-cream)", padding: "48px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>
        {/* Heading */}
        <h2
          className="text-center"
          style={{
            fontFamily: "var(--font-montserrat)",
            fontSize: "22px",
            fontWeight: 800,
            color: "var(--color-black)",
            marginBottom: "32px",
          }}
        >
          <span aria-hidden>🤍 </span>SHOP OUR COLLECTIONS<span aria-hidden> 🤍</span>
        </h2>

        {/* Up to 6 tiles */}
        <div
          className={`grid ${GRID_COLUMNS[count]}`}
          style={{
            gap: `${GAP_PX}px`,
            margin: "0 auto",
            maxWidth: count < SHOP_COLLECTIONS_MAX ? `calc((100% + ${GAP_PX}px) * ${count} / ${SHOP_COLLECTIONS_MAX} - ${GAP_PX}px)` : undefined,
          }}
        >
          {tiles.slice(0, count).map(({ name, handle, image }) => (
            <Link
              key={handle}
              href={`/shop/${handle}`}
              className="focus-ring block overflow-hidden relative transition-transform duration-[250ms] hover:scale-[1.04]"
              style={{
                aspectRatio: "1/1",
                borderRadius: "12px",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              {/* Image area — full tile; a plain surface when Shopify has no photo */}
              <div className="absolute inset-0" style={{ backgroundColor: "var(--color-gray-light)" }}>
                {image && (
                  // Decorative: the collection name is on the tile, in the same link
                  <Image src={image.url} alt="" fill sizes="(min-width: 1024px) 190px, 33vw" className="object-cover" />
                )}
              </div>

              {/* Label overlay — gradient at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 text-center"
                style={{
                  background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.72) 100%)",
                  padding: "20px 8px 8px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-montserrat)",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
