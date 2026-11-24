"use client"

import { useEffect, useState } from "react"

export const ROTATE_MS = 5000

/** Rotate only when there is something to rotate to and the visitor hasn't asked for less motion. */
export function shouldRotate(count: number, reducedMotion: boolean): boolean {
  return count > 1 && !reducedMotion
}

/**
 * The mobile announcement strip: one message at a time, crossfading (opacity only, no sliding) every
 * 5 seconds. Every message is stacked in the same 32px box, so the page never shifts when it rotates.
 * With `prefers-reduced-motion: reduce` it shows the first message and never rotates. Plain text, not a link.
 */
export function AnnouncementStrip({ messages }: { messages: readonly string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    let timer: ReturnType<typeof setInterval> | undefined

    const apply = () => {
      clearInterval(timer)
      timer = undefined
      if (shouldRotate(messages.length, query.matches)) {
        timer = setInterval(() => setIndex((i) => (i + 1) % messages.length), ROTATE_MS)
      } else {
        setIndex(0)
      }
    }

    apply()
    query.addEventListener("change", apply)
    return () => {
      clearInterval(timer)
      query.removeEventListener("change", apply)
    }
  }, [messages.length])

  return (
    <div className="relative h-8 md:hidden" style={{ backgroundColor: "var(--color-honey-yellow)" }}>
      {messages.map((message, i) => (
        <p
          key={message}
          aria-hidden={i !== index}
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap px-4 text-[11px] font-bold uppercase tracking-wide transition-opacity duration-700 motion-reduce:transition-none"
          style={{
            fontFamily: "var(--font-montserrat)",
            color: "var(--color-ink)",
            opacity: i === index ? 1 : 0,
          }}
        >
          {message}
        </p>
      ))}
    </div>
  )
}
