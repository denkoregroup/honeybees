import type { Metadata } from "next"
import { Mail, Clock, MapPin } from "lucide-react"
import { ContactForm } from "@/components/features/ContactForm"

export const metadata: Metadata = {
  title: "Contact Us | HoneyBee Designs",
  description:
    "Get in touch with HoneyBee Designs — custom orders, bulk pricing, and general inquiries welcome.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="mb-10 text-center">
        <h1 className="text-[28px] font-black text-[var(--color-ink)]">
          ♥ CONTACT US ♥
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-secondary)]">
          Questions, custom orders, or just want to say hi? We&apos;d love to hear from you!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left sidebar */}
        <div className="space-y-6">
          {[
            {
              Icon: Mail,
              title: "Email",
              lines: ["hello@honeybeedesigns.com", "We reply within 1 business day"],
            },
            {
              Icon: Clock,
              title: "Hours",
              lines: ["Mon–Fri: 9am – 5pm EST", "Weekends: Closed"],
            },
            {
              Icon: MapPin,
              title: "Location",
              lines: ["Based in the USA", "Shipping worldwide"],
            },
          ].map(({ Icon, title, lines }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-topbar)]">
                <Icon className="h-5 w-5 text-[var(--color-coral)]" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[var(--color-ink)]">{title}</p>
                {lines.map((line) => (
                  <p key={line} className="text-[13px] text-[var(--color-secondary)]">{line}</p>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-2xl bg-[var(--color-topbar)] p-5">
            <p className="text-[14px] font-black text-[var(--color-coral)]">CUSTOM ORDERS</p>
            <p className="mt-1 text-[13px] text-[var(--color-secondary)]">
              Looking for a fully custom design, bulk order, or team package? Use the form and
              describe your vision — we&apos;ll send a quote within 24hrs.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8">
            <h2 className="mb-6 text-[18px] font-black text-[var(--color-ink)]">
              Send a Message ♥
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
