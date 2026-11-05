import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const root = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      // Matches "paths" in tsconfig.json
      "@": root("./"),
      "server-only": root("./test/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/.next/**"],
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
})
