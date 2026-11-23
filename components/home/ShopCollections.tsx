import Link from "next/link"

const COLLECTIONS = [
  {
    name: "DOG TAGS",
    handle: "dog-tags",
    // TODO: real collection photo from Drive (dark bg, dog tag photo)
    placeholder: "#1A1A1A",
  },
  {
    name: "CAR COASTERS",
    handle: "car-coasters",
    // TODO: real collection photo (dark bg, sunflower coaster)
    placeholder: "#2D2D2D",
  },
  {
    name: "VINYL DECALS",
    handle: "vinyl-decals",
    // TODO: real collection photo (black bg, mountain decal)
    placeholder: "#1A1A1A",
  },
  {
    name: "STICKERS",
    handle: "stickers-decals",
    // TODO: real collection photo (checkered bg, "Good Vibes")
    placeholder: "#E8D5C4",
  },
  {
    name: "CUSTOM SIGNS",
    handle: "custom-signs",
    // TODO: real collection photo (cream bg, "home sweet home")
    placeholder: "#F5ECD7",
  },
  {
    name: "GIFT IDEAS",
    handle: "gift-ideas",
    // TODO: real collection photo (pink bg, gift box + mug)
    placeholder: "#FFE4E8",
  },
]

export function ShopCollections() {
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
          🤍 SHOP OUR COLLECTIONS 🤍
        </h2>

        {/* 6-tile grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" style={{ gap: "8px" }}>
          {COLLECTIONS.map(({ name, handle, placeholder }) => (
            <Link
              key={handle}
              href={`/shop/${handle}`}
              className="block overflow-hidden relative transition-transform duration-[250ms] hover:scale-[1.04]"
              style={{
                aspectRatio: "1/1",
                borderRadius: "12px",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              {/* Image area — full tile */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: placeholder }}
              >
                {/* TODO: real collection photo */}
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
