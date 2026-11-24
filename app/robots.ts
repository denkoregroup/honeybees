import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    // The cart is per visitor and the API routes only take form posts: nothing there to index.
    rules: { userAgent: "*", allow: "/", disallow: ["/cart", "/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}
