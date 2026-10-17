import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Site de projeto no GitHub Pages, servido em /dev-workflow-starter/.
  // O workflow da AWS publica o mesmo build na raiz do bucket com --base /.
  base: "/dev-workflow-starter/",
  plugins: [react()],
  build: {
    // Fontes viram arquivo, nunca data: URI, para caber num CSP com font-src 'self'.
    assetsInlineLimit: (arquivo) => (/\.woff2?$/.test(arquivo) ? false : undefined),
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    exclude: ["node_modules/**", "dist/**", "e2e/**", ".github/**"],
  },
});
