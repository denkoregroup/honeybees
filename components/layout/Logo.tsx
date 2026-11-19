import Image from "next/image"

/**
 * The HoneyBee Designs logo. It has light and yellow letters, so it belongs on the cream or white page
 * ground, never on honey or blush. Size it by height (for example `h-16`); the width follows.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/images/logo.png"
      width={1536}
      height={709}
      alt="HoneyBee Designs"
      sizes="225px"
      className={className}
    />
  )
}
