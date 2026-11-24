import type { Metadata } from "next"
import { Inter, Montserrat, Pacifico } from "next/font/google"
import "./globals.css"
import { TopBar } from "@/components/layout/TopBar"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CartDrawer } from "@/components/features/CartDrawer"
import { BASE_OPEN_GRAPH, SITE_NAME, SITE_URL } from "@/lib/site"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
})

const pacifico = Pacifico({
  subsets: ["latin"],
  variable: "--font-pacifico",
  display: "swap",
  weight: "400",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages set a short title ("Shop All") and the template adds the brand; the home page sets its own.
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Custom sublimation apparel, drinkware, keychains, accessories and gifts. Handmade with love, shipped with smiles.",
  keywords: [
    "sublimation",
    "custom merch",
    "custom apparel",
    "personalized gifts",
    "drinkware",
    "keychains",
    "decals",
  ],
  // No og:url here: every page would inherit the home URL. Product pages set their own.
  openGraph: BASE_OPEN_GRAPH,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} ${pacifico.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[var(--color-cream)] text-[var(--color-ink)]">
        {/* First thing a keyboard user reaches: jumps past the top bar and header. Hidden until focused. */}
        <a
          href="#main-content"
          className="focus-ring sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-[14px] focus:font-bold focus:text-[var(--color-ink)] focus:shadow-md"
        >
          Skip to main content
        </a>
        <TopBar />
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  )
}
