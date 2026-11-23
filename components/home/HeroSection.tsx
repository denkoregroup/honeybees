"use client"

import Link from "next/link"

// Set to true once Sarah provides the 7 hero images in /public/images/hero/
const hasImages = false

export function HeroSection() {
  return (
    <>
    {/* Mobile (below md): no card, straight on cream */}
    <section className="px-4 pb-8 pt-6 md:hidden">
      <span
        className="inline-block rounded-full px-3.5 py-1 text-[11px] font-bold tracking-[0.05em]"
        style={{ backgroundColor: "var(--color-honey-yellow)", color: "var(--color-ink)", fontFamily: "var(--font-montserrat)" }}
      >
        MADE JUST FOR YOU!
      </span>

      <h1
        className="mt-4 text-[40px] font-extrabold uppercase leading-[40px]"
        style={{ fontFamily: "var(--font-montserrat)", color: "var(--color-ink)" }}
      >
        Cute. Custom. <span style={{ color: "var(--color-coral-display)" }}>Made</span>
      </h1>
      <p className="mt-2 text-[24px] leading-8" style={{ fontFamily: "var(--font-pacifico)", color: "var(--color-ink)" }}>
        to make you smile!
      </p>

      <Link href="/shop" className="btn-primary focus-ring mt-6 w-full">
        Shop now ♥
      </Link>
    </section>

    <section
      className="relative hidden w-full overflow-hidden md:block"
      style={{
        backgroundColor: "#FFFFFF",
        minHeight: "480px",
      }}
    >
      <div
        className="flex flex-col md:flex-row"
        style={{ minHeight: "480px" }}
      >
        {/* ── Left (~42%) ── */}
        <div
          className="flex flex-col justify-center"
          style={{
            width: "100%",
            paddingLeft: "clamp(24px, 5vw, 64px)",
            paddingRight: "clamp(16px, 3vw, 40px)",
            paddingTop: "40px",
            paddingBottom: "40px",
            flex: "0 0 42%",
          }}
        >
          {/* Eyebrow pill with floating hearts */}
          <div className="relative inline-block mb-4" style={{ alignSelf: "flex-start" }}>
            <span
              className="inline-block text-white"
              style={{
                backgroundColor: "var(--color-primary)",
                borderRadius: "9999px",
                padding: "4px 14px",
                fontFamily: "var(--font-montserrat)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              MADE JUST FOR YOU!
            </span>
            <span
              aria-hidden
              className="absolute"
              style={{ top: "-8px", right: "-10px", fontSize: "10px", color: "var(--color-primary)" }}
            >
              🤍
            </span>
            <span
              aria-hidden
              className="absolute"
              style={{ bottom: "-8px", left: "-8px", fontSize: "8px", color: "var(--color-primary)" }}
            >
              🤍
            </span>
          </div>

          {/* H1 */}
          <h1 style={{ lineHeight: 1.05, margin: 0 }}>
            <span
              className="block"
              style={{
                fontFamily: "var(--font-montserrat)",
                fontSize: "clamp(26px, 3vw, 42px)",
                fontWeight: 800,
                color: "var(--color-black)",
              }}
            >
              Cute. Custom.
            </span>
            <span
              className="block"
              style={{
                fontFamily: "var(--font-montserrat)",
                fontSize: "clamp(72px, 10vw, 120px)",
                fontWeight: 900,
                color: "var(--color-primary)",
                letterSpacing: "-0.03em",
                lineHeight: 0.9,
              }}
            >
              MADE
            </span>
            <span
              className="block"
              style={{
                fontFamily: "var(--font-montserrat)",
                fontSize: "clamp(22px, 2.8vw, 38px)",
                fontWeight: 800,
                color: "var(--color-black)",
              }}
            >
              TO MAKE YOU
            </span>
            <span
              className="block"
              style={{
                fontFamily: "var(--font-montserrat)",
                fontSize: "clamp(30px, 4vw, 52px)",
                fontWeight: 900,
                color: "var(--color-primary)",
              }}
            >
              SMILE! 🤍 🤍
            </span>
          </h1>

          {/* CTA */}
          <div style={{ marginTop: "28px" }}>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-white transition-colors"
              style={{
                backgroundColor: "var(--color-black)",
                padding: "13px 32px",
                borderRadius: "9999px",
                fontFamily: "var(--font-montserrat)",
                fontSize: "14px",
                fontWeight: 700,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--color-primary)"
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--color-black)"
              }}
            >
              SHOP NOW 🤍
            </Link>
          </div>
        </div>

        {/* ── Right (~58%) — hero image slots ── */}
        <div
          className="relative flex items-center justify-center"
          style={{
            flex: "0 0 58%",
            background: "linear-gradient(135deg, #FFF7E6, #FFF0E0)",
            overflow: "hidden",
            minHeight: "380px",
          }}
        >
          {hasImages ? (
            <>
              {/*
               * Slot: tumbler
               * File: /public/images/hero/tumbler.png
               * Pink tumbler with sunflower design — center-left of collage
               */}
              <div
                data-slot="tumbler"
                className="absolute"
                style={{ bottom: "10%", left: "20%", width: "160px", height: "200px" }}
              >
                {/* TODO: <img src="/images/hero/tumbler.png" alt="Custom tumbler" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> */}
              </div>

              {/*
               * Slot: pillow
               * File: /public/images/hero/pillow.png
               * White pillow with floral design — right side
               */}
              <div
                data-slot="pillow"
                className="absolute"
                style={{ top: "10%", right: "12%", width: "140px", height: "140px" }}
              >
                {/* TODO: <img src="/images/hero/pillow.png" alt="Custom pillow" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> */}
              </div>

              {/*
               * Slot: keychain
               * File: /public/images/hero/keychain.png
               * Small keychain — right side, below pillow
               */}
              <div
                data-slot="keychain"
                className="absolute"
                style={{ top: "55%", right: "10%", width: "80px", height: "100px" }}
              >
                {/* TODO: <img src="/images/hero/keychain.png" alt="Custom keychain" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> */}
              </div>

              {/*
               * Slot: mug
               * File: /public/images/hero/mug.png
               * Mug with custom design — lower center
               */}
              <div
                data-slot="mug"
                className="absolute"
                style={{ bottom: "8%", left: "48%", width: "120px", height: "120px" }}
              >
                {/* TODO: <img src="/images/hero/mug.png" alt="Custom mug" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> */}
              </div>

              {/*
               * Slot: floral-left
               * File: /public/images/hero/floral-left.png
               * Floral/botanical illustration — left edge overlay
               */}
              <div
                data-slot="floral-left"
                className="absolute"
                style={{ top: "0", left: "0", width: "120px", height: "200px" }}
              >
                {/* TODO: <img src="/images/hero/floral-left.png" alt="" aria-hidden style={{ width: "100%", height: "100%", objectFit: "contain" }} /> */}
              </div>

              {/*
               * Slot: floral-right
               * File: /public/images/hero/floral-right.png
               * Floral illustration — bottom-right corner overlay
               */}
              <div
                data-slot="floral-right"
                className="absolute"
                style={{ bottom: "0", right: "0", width: "120px", height: "160px" }}
              >
                {/* TODO: <img src="/images/hero/floral-right.png" alt="" aria-hidden style={{ width: "100%", height: "100%", objectFit: "contain" }} /> */}
              </div>

              {/*
               * Slot: floral-top-right
               * File: /public/images/hero/floral-top-right.png
               * Small floral sprig — top-right accent
               */}
              <div
                data-slot="floral-top-right"
                className="absolute"
                style={{ top: "0", right: "0", width: "80px", height: "80px" }}
              >
                {/* TODO: <img src="/images/hero/floral-top-right.png" alt="" aria-hidden style={{ width: "100%", height: "100%", objectFit: "contain" }} /> */}
              </div>
            </>
          ) : (
            /* Placeholder shown until Sarah provides images */
            <div
              className="flex flex-col items-center justify-center rounded-2xl text-center"
              style={{
                width: "90%",
                height: "380px",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "48px" }}>🐝</span>
              <p style={{ fontFamily: "var(--font-montserrat)", fontWeight: 600, fontSize: "14px", color: "var(--color-black)" }}>
                Product photos coming from Sarah!
              </p>
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "var(--color-gray)" }}>
                7 image slots ready
              </p>
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "var(--color-gray)" }}>
                tumbler · pillow · keychain · mug · 3 florals
              </p>
            </div>
          )}

          {/* Floating circle badge — top right */}
          <div
            className="absolute flex flex-col items-center justify-center text-center text-white"
            style={{
              top: "20px",
              right: "20px",
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              backgroundColor: "var(--color-primary)",
              padding: "12px",
            }}
          >
            <span style={{ fontFamily: "var(--font-montserrat)", fontSize: "13px", fontWeight: 800, lineHeight: 1.2 }}>CUSTOM</span>
            <span style={{ fontFamily: "var(--font-montserrat)", fontSize: "11px", lineHeight: 1.2 }}>DESIGNS,</span>
            <span style={{ fontFamily: "var(--font-montserrat)", fontSize: "10px", lineHeight: 1.2 }}>NAMES, PHOTOS</span>
            <span style={{ fontFamily: "var(--font-montserrat)", fontSize: "11px", fontWeight: 700, lineHeight: 1.2 }}>&amp; MORE!</span>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}
