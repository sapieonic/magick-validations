import { defineConfig } from "cypress";

export default defineConfig({
  defaultCommandTimeout: 15000,
  requestTimeout: 20000,
  responseTimeout: 30000,
  video: false,
  screenshotOnRunFailure: true,
  retries: {
    runMode: 1,
    openMode: 0,
  },

  env: {
    APP_BASE_URL: process.env.MV_APP_BASE_URL || "https://staging.app.magickvoice.com",
    MV_TEST_EMAIL: process.env.MV_TEST_EMAIL || "",
    MV_TEST_PASSWORD: process.env.MV_TEST_PASSWORD || "",
  },

  e2e: {
    baseUrl: process.env.MV_APP_BASE_URL || "https://staging.app.magickvoice.com",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(on, config) {
      on("task", {
        log(message: string) {
          console.log(message);
          return null;
        },
      });

      return config;
    },
  },
});
