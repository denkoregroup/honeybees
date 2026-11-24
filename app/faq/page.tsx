import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"
import { Accordion } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

// All copy is Sarah's (her May 9, 2026 email), lightly edited for tone. Don't add facts she didn't give.

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Turnaround times, custom orders, printing methods, apparel brands and care instructions for HoneyBee Designs.",
}

const linkClass = "focus-ring font-semibold text-[var(--color-coral-ink)] underline underline-offset-2"

// The social URLs already used by the home page's EmailSignup.
const SOCIAL = [
  { label: "Facebook", href: "https://facebook.com/honeybeedesigns" },
  { label: "Instagram", href: "https://instagram.com/honeybeedesigns" },
  { label: "TikTok", href: "https://tiktok.com/@honeybeedesigns" },
]

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 list-disc space-y-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

const QUESTIONS = [
  {
    title: "How long is turnaround time?",
    content: (
      <p>
        Most orders have a turnaround time of approximately 3–4 business days unless otherwise stated. Larger
        custom or bulk orders may take slightly longer depending on the size and details of the order. This doesn&apos;t
        include shipping time, and holidays and busy seasons may extend it slightly.
      </p>
    ),
  },
  {
    title: "When will my order ship?",
    content: (
      <p>
        Orders are shipped after production is complete. Once your order ships, you&apos;ll receive tracking
        information by email or message.
      </p>
    ),
  },
  {
    title: "Do you offer custom orders?",
    content: (
      <p>
        Yes! We love custom orders. You can upload your own design, inspiration photo, logo or idea and we&apos;ll
        help bring it to life.
      </p>
    ),
  },
  {
    title: "What printing methods do you use?",
    content: (
      <>
        <p>We offer:</p>
        <List items={["Sublimation printing", "DTF (Direct To Film)", "UV DTF", "Custom vinyl & decals"]} />
      </>
    ),
  },
  {
    title: "What apparel brands do you use?",
    content: (
      <>
        <p>We commonly use:</p>
        <List items={["Comfort Colors", "Gildan", "Bella Canvas", "Next Level", "Jerzees"]} />
        <p className="mt-2">depending on product availability and style.</p>
      </>
    ),
  },
  {
    title: "Can I use my own logo or design?",
    content: <p>Absolutely! Please make sure images are clear and high quality for the best printing results.</p>,
  },
  {
    title: "Where can I contact you?",
    content: (
      <>
        <p>You can message us through:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {SOCIAL.map(({ label, href }) => (
            <li key={label}>
              <a href={href} className={linkClass}>
                {label}
              </a>
            </li>
          ))}
          <li>
            Our{" "}
            <Link href="/contact" className={linkClass}>
              website contact form
            </Link>
          </li>
        </ul>
        <p className="mt-2">We&apos;re always happy to help!</p>
      </>
    ),
  },
]

const CARE = [
  {
    title: "Apparel care",
    intro: "To keep your items looking their best:",
    steps: [
      "Wash inside out",
      "Machine wash cold",
      "Mild detergent only",
      "Do not bleach",
      "Tumble dry low or hang dry",
      "Do not iron directly on the design",
      "Do not dry clean",
    ],
    outro: "Proper care helps preserve the design and extend the life of your apparel.",
  },
  {
    title: "Tumbler & glass care",
    intro: null,
    steps: ["Hand wash only", "Do not microwave", "Avoid extreme heat", "Do not soak", "Handle with care"],
    outro: "This helps protect the design and finish of your custom drinkware.",
  },
]

const METHODS = [
  {
    title: "What is sublimation printing?",
    about:
      "Sublimation printing is a process where ink is infused directly into the material using heat. This creates a smooth, vibrant, long-lasting design that won't peel or crack.",
    bestFor: ["Light colored apparel", "Polyester fabrics", "Tumblers", "Mugs", "Accessories", "Hard surface products"],
    note: "Sublimation designs feel soft because the ink becomes part of the material itself.",
  },
  {
    title: "What is DTF printing?",
    about:
      "DTF stands for Direct To Film printing. Designs are printed onto a special film and then heat pressed onto fabric.",
    bestFor: ["Cotton apparel", "Dark colored shirts", "Bright vibrant designs", "Bulk apparel printing", "Detailed graphics"],
    note: "DTF transfers have a soft feel with bold colors and allow designs to be placed on many different fabric types.",
  },
]

const DIFFERENCE = [
  {
    title: "Sublimation",
    points: [
      "Ink becomes part of the material",
      "Best on polyester and light colors",
      "No texture or feel on fabric",
      "Great for tumblers & accessories",
    ],
  },
  {
    title: "DTF",
    points: ["Transfer pressed onto fabric", "Works on cotton & dark colors", "Bright vibrant prints", "Great for apparel & logos"],
  },
]

const card = "rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8"
const h2Class = "mb-4 text-[20px] font-black text-[var(--color-ink)]"
const h3Class = "text-[15px] font-bold text-[var(--color-ink)]"
const body = "text-[14px] leading-relaxed text-[var(--color-secondary)]"

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-[28px] font-black text-[var(--color-ink)]">
          <span aria-hidden>♥ </span>FAQ<span aria-hidden> ♥</span>
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-secondary)]">
          Frequently asked questions, care instructions, and how we print.
        </p>
      </div>

      <section aria-labelledby="faq-questions" className={card}>
        <h2 id="faq-questions" className={h2Class}>
          Frequently Asked Questions
        </h2>
        <Accordion items={QUESTIONS} />
        <p className={`mt-6 ${body}`}>
          Returns, refunds and shipping are covered in our store policies, linked at the bottom of every page.
        </p>
      </section>

      <section aria-labelledby="faq-care">
        <h2 id="faq-care" className={h2Class}>
          Care Instructions
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {CARE.map(({ title, intro, steps, outro }) => (
            <div key={title} className={card}>
              <h3 className={h3Class}>{title}</h3>
              <div className={`mt-2 ${body}`}>
                {intro && <p>{intro}</p>}
                <List items={steps} />
                <p className="mt-3">{outro}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq-methods">
        <h2 id="faq-methods" className={h2Class}>
          Sublimation vs DTF
        </h2>
        <div className="space-y-6">
          {METHODS.map(({ title, about, bestFor, note }) => (
            <div key={title} className={card}>
              <h3 className={h3Class}>{title}</h3>
              <div className={`mt-2 ${body}`}>
                <p>{about}</p>
                <p className="mt-3 font-semibold text-[var(--color-ink)]">Best for:</p>
                <List items={bestFor} />
                <p className="mt-3">{note}</p>
              </div>
            </div>
          ))}

          <div className={card}>
            <h3 className={h3Class}>What&apos;s the difference?</h3>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {DIFFERENCE.map(({ title, points }) => (
                <div key={title}>
                  <p className="text-[14px] font-bold text-[var(--color-ink)]">{title}</p>
                  <ul className={`mt-2 space-y-1 ${body}`}>
                    {points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <Check aria-hidden className="mt-1 h-4 w-4 flex-shrink-0 text-[var(--color-coral-ink)]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className={`mt-6 ${body}`}>
              Both methods create beautiful custom products. The best option depends on the item, fabric and look
              you want.
            </p>
          </div>
        </div>
      </section>

      <section className="text-center">
        <p className="text-[14px] text-[var(--color-secondary)]">Still have a question?</p>
        <Button asChild className="focus-ring mt-3">
          <Link href="/contact">Contact Us</Link>
        </Button>
      </section>
    </div>
  )
}
