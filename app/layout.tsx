import type { Metadata } from "next"
import { Inter, Montserrat, Pacifico } from "next/font/google"
import "./globals.css"
import { TopBar } from "@/components/layout/TopBar"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CartDrawer } from "@/components/features/CartDrawer"

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
  title: {
    default: "HoneyBee Designs | Cute. Custom. Made to Make You Smile!",
    template: "%s | HoneyBee Designs",
  },
  description:
    "Custom sublimation apparel, drinkware, keychains, accessories and gifts. Handmade with love, shipped with smiles. 5,000+ happy customers!",
  keywords: [
    "sublimation",
    "custom merch",
    "custom apparel",
    "personalized gifts",
    "drinkware",
    "keychains",
    "decals",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://honeybeedesigns.com",
    siteName: "HoneyBee Designs",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} ${pacifico.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[var(--color-cream)] text-[var(--color-ink)]">
        <TopBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  )
}
