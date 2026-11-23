import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photos come from Shopify's CDN. Next's image optimizer answers 400 for any host not listed
    // here, so this is the only place images are allowed from. `search` is left out on purpose: Shopify
    // image URLs end in `?v=<version>`, and `search: ""` would reject them.
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com", pathname: "/s/files/**" }],
  },
};

export default nextConfig;
