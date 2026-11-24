import { Metadata } from "next"
import Link from "next/link"
import { Hexagon, Heart, Paintbrush, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn the story behind HoneyBee Designs — a custom sublimation merch brand built on vibrant colors and lasting quality.",
}

const values = [
  {
    icon: Paintbrush,
    title: "Made to Order",
    description:
      "Every item is printed just for you. No mass production, no wasted inventory — only pieces you'll actually love.",
  },
  {
    icon: Heart,
    title: "Quality First",
    description:
      "We source premium blanks and use professional sublimation equipment to ensure prints that outlast the garment.",
  },
  {
    icon: Package,
    title: "Shipped with Care",
    description:
      "Every order is carefully packaged and inspected before it leaves our hands. Your satisfaction is our standard.",
  },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-honey/10 to-cream-dark">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-honey/20">
            <Hexagon className="h-8 w-8 fill-primary/20 text-[var(--color-coral-ink)]" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            The Story Behind the Hive
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            HoneyBee Designs started as a passion project and grew into something
            sweeter — a boutique sublimation merch brand committed to color,
            quality, and creativity.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="prose prose-neutral max-w-none">
          <p className="text-base leading-8 text-muted-foreground">
            What started in a small home studio — a single heat press, a handful of
            test shirts, and a whole lot of trial and error — has grown into a
            thriving made-to-order brand. We believe that what you wear should be
            as unique as you are, and sublimation printing makes that possible with
            colors that simply don&apos;t fade.
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            Every design in our catalog is original artwork, crafted in-house. We
            collaborate with local artists, take custom commissions, and welcome bulk
            orders for teams, events, and businesses. If you can imagine it, we can
            print it.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream-dark">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="mb-10 text-center text-2xl font-bold">Our Values</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-honey/15">
                  <v.icon className="h-6 w-6 text-[var(--color-coral-ink)]" />
                </div>
                <h3 className="mb-2 font-semibold">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-bold">Want something custom?</h2>
        <p className="mt-3 text-muted-foreground">
          Reach out and let&apos;s create something together.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/contact">Get in Touch</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/shop">Browse the Shop</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
