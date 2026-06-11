import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom", // Isso avisa ao Vitest para simular um navegador!
    globals: true,
  },
});
