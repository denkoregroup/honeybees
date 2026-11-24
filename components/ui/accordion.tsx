"use client"

import { useState, useId } from "react"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

interface AccordionItem {
  title: string
  content: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  defaultOpen?: number
}

export function Accordion({ items, defaultOpen }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen ?? null)
  const id = useId()

  return (
    <div className="divide-y divide-[var(--color-border)]">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        const panelId = `${id}-panel-${i}`
        const triggerId = `${id}-trigger-${i}`
        return (
          <div key={i}>
            <button
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="focus-ring flex w-full items-center justify-between py-4 text-left text-[14px] font-bold uppercase tracking-wide text-[var(--color-ink)] transition-colors hover:text-[var(--color-coral-ink)]"
            >
              {item.title}
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 text-[13px] leading-relaxed text-[var(--color-secondary)]">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
