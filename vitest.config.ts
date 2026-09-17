import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    env: {
      NEXT_PUBLIC_FLASHCASTR_API_URL: "https://api.flashcastr.test",
    },
  },
});
