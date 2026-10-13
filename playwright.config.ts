import { defineConfig, devices } from "@playwright/test";

const PORTA = 4173;

export default defineConfig({
  testDir: "e2e",
  testMatch: "*.e2e.ts",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORTA}/dev-workflow-starter/`,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: `npx vite preview --port ${PORTA} --strictPort`,
    port: PORTA,
    reuseExistingServer: true,
  },
});
