import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 15_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    headless: true,
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: "npm run start",
    port: 3100,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: "before",
      testDir: "./before",
      retries: 0,
      use: {
        trace: "off",
      },
    },
    {
      name: "after",
      testDir: "./after",
      retries: process.env.CI ? 2 : 0,
      use: {
        trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
      },
    },
  ],
});
