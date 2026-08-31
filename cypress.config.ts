import { defineConfig } from "cypress";
import * as fs from "fs";
import * as path from "path";
import { notifySlackOfCypressRun } from "./scripts/slack-notify";

function loadEnvFile(): Record<string, string> {
  const envPath = path.resolve(__dirname, ".env");
  const result: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || "").trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        result[match[1]] = val;
      }
    }
  }
  return result;
}

const fileEnv = loadEnvFile();

export default defineConfig({
  defaultCommandTimeout: 15000,
  requestTimeout: 20000,
  responseTimeout: 30000,
  video: true,
  videoCompression: 32,
  videosFolder: "cypress/videos",
  trashAssetsBeforeRuns: true,
  screenshotOnRunFailure: true,
  viewportWidth: 1440,
  viewportHeight: 900,
  retries: {
    runMode: 1,
    openMode: 0,
  },

  env: {
    APP_BASE_URL: process.env.MV_APP_BASE_URL || process.env.CYPRESS_MV_APP_BASE_URL || fileEnv.MV_APP_BASE_URL || "https://staging.app.magickvoice.com",
    MV_TEST_EMAIL: process.env.MV_TEST_EMAIL || process.env.CYPRESS_MV_TEST_EMAIL || fileEnv.MV_TEST_EMAIL || "",
    MV_TEST_PASSWORD: process.env.MV_TEST_PASSWORD || process.env.CYPRESS_MV_TEST_PASSWORD || fileEnv.MV_TEST_PASSWORD || "",
    MV_TEST_PHONE: process.env.MV_TEST_PHONE || process.env.CYPRESS_MV_TEST_PHONE || fileEnv.MV_TEST_PHONE || "",
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || fileEnv.SLACK_BOT_TOKEN || "",
    SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID || fileEnv.SLACK_CHANNEL_ID || "",
  },

  chromeWebSecurity: false,
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    configFile: "reporter-config.json",
  },
  e2e: {
    baseUrl: process.env.MV_APP_BASE_URL || process.env.CYPRESS_MV_APP_BASE_URL || fileEnv.MV_APP_BASE_URL || "https://staging.app.magickvoice.com",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(on, config) {
      on("task", {
        log(message: string) {
          console.log(message);
          return null;
        },
      });

      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.family === "chromium" && browser.name !== "electron") {
          launchOptions.args.push("--disable-gpu-shader-disk-cache");
          launchOptions.args.push("--window-size=1440,900");
          launchOptions.args.push("--force-device-scale-factor=1");
        }
        return launchOptions;
      });
      
      on("after:run", async (results) => {
        await notifySlackOfCypressRun(results, {
          token: config.env.SLACK_BOT_TOKEN,
          channel: config.env.SLACK_CHANNEL_ID,
        });
      });

      return config;
    },
  },
});
