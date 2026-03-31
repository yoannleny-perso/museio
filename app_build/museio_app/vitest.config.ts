import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@museio/types": fileURLToPath(
        new URL("./packages/types/src/index.ts", import.meta.url)
      ),
      "@museio/domain": fileURLToPath(
        new URL("./packages/domain/src/index.ts", import.meta.url)
      ),
      "@museio/validation": fileURLToPath(
        new URL("./packages/validation/src/index.ts", import.meta.url)
      ),
      "@museio/ui": fileURLToPath(
        new URL("./packages/ui/src/index.ts", import.meta.url)
      )
    }
  },
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"]
  }
});
