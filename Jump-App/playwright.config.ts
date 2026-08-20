// import type { PlaywrightTestConfig } from "@playwright/test";
// import { devices } from "@playwright/test";
// import dotenv from "dotenv";
// import fs from "node:fs";
// import path from "node:path";
// import os from "node:os";
// import { getEnvVariable } from "@utilities/env.utils";

// const env = process.env.NODE_ENV || "staging";
// dotenv.config({ path: `./src/config/.env.${env}`})
// // const envPath = path.resolve(process.cwd(), "src", "config", `.env.${env}`);
// // if (fs.existsSync(envPath)) {
// //   dotenv.config({ path: envPath, override: true });
// // }
// const { SKIP_GLOBAL_LOGIN, SKIP_GLOBAL_TEARDOWN } = process.env;
// const skipGlobalLogin = SKIP_GLOBAL_LOGIN === "true";
// const skipGlobalTeardown = SKIP_GLOBAL_TEARDOWN === "true";

// const authStoragePath = path.resolve(process.cwd(), "src/cookies/jumpapp-google-auth.json");
// // const baseURL = process.env.JUMPAPP_BASE_URL || "https://staging.jumpapp.dev/";

// const viewport = { width: 1440, height: 972 };

// const config: PlaywrightTestConfig = {
//   testDir: "./src/specs/",
//   timeout: 300 * 1000,
//   expect: {
//     timeout: 30 * 1000,
//   },
//   fullyParallel: true,
//   forbidOnly: !!process.env.CI,
//   retries: 0,
//   workers: 1,

//   reporter: [
//     ["list", { printSteps: true }],
//     [
//       "allure-playwright",
//       {
//         detail: true,
//         outputFolder: "allure-results",
//         suiteTitle: true,
//         environmentInfo: {
//           OS: os.platform(),
//           Architecture: os.arch(),
//           NodeVersion: process.version,
//         },
//         categories: [
//           {
//             name: "Missing file errors",
//             messageRegex: /^ENOENT: no such file or directory/,
//           },
//         ],
//       },
//     ],
//     ["html", { open: "never" }],
//   ],

//   use: {
//     video: "retain-on-failure",
//     actionTimeout: 45 * 1000,
//     headless: false,
//     trace: "retain-on-failure",
//     screenshot: "only-on-failure",
//     viewport,
//     permissions: ["microphone"],
//   },

//   projects: [
//     {
//       name: "Login",
//       testMatch: ["**/login.spec.ts"],
//       use: {
//         launchOptions: {
//           args: ["--disable-popup-blocking"],
//         },
//       },
//     },
//     ...(skipGlobalLogin
//       ? []
//       : [
//           {
//             name: "setup",
//             workers: 4,
//             testMatch: ["**/login.spec.ts"],
//             use: {
//               launchOptions: {
//                 args: ["--disable-popup-blocking"],
//               },
//             },
//           },
//         ]),
//     {
//       name: "Chromium",
//       testIgnore: ["**/login.spec.ts", "**/college.spec.ts"],
//       dependencies: skipGlobalLogin ? [] : ["setup"],
//       use: {
//         ...devices["Desktop Chrome"],
//         channel: "chrome",
//         viewport,
//         video: "retain-on-failure",
//         storageState: authStoragePath,
//       },
//     },
//     {
//       name: "Colleges Spec (Chromium)",
//       testIgnore: ["**/login.spec.ts"],
//       testMatch: ["**/college.spec.ts"],
//       dependencies: skipGlobalLogin ? [] : ["setup"],
//       fullyParallel: false,
//       workers: 1,
//       use: {
//         ...devices["Desktop Chrome"],
//         channel: "chrome",
//         viewport,
//         video: "retain-on-failure",
//       },
//     },
//   ],
//   globalSetup: require.resolve("./src/utilities/global/global-setup.utils.ts"),
//   ...(skipGlobalTeardown
//     ? {}
//     : {
//         globalTeardown: require.resolve(
//           './src/utilities/global/global-teardown.utils.ts',
//         ),
//       }),
// };

// export default config;
import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";
import dotenv from "dotenv";
import os from "node:os";

// Load environment variables
const env = process.env.NODE_ENV || "staging";
dotenv.config({ path: `./src/config/.env.${env}` });

const baseUrl = process.env.JUMPAPP_BASE_URL || process.env.URL;

const config: PlaywrightTestConfig = {
  testDir: "./src/specs",
  timeout: 90 * 1000,
  expect: {
    timeout: 60 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  captureGitInfo: { commit: true, diff: true },
  reporter: [
    ["list", { printSteps: true }],
    [
      "allure-playwright",
      {
        detail: true,
        resultsDir: "allure-results",
        suiteTitle: true,
        environmentInfo: {
          OS: os.platform(),
          Architecture: os.arch(),
          NodeVersion: process.version,
          url: baseUrl,
        },
        categories: [
          {
            name: "Missing file errors",
            messageRegex: /^ENOENT: no such file or directory/,
          },
        ],
      },
    ],
    ["html", { open: "never", title: "Assembly Web-e2e Report" }],
  ],

  use: {
    video: "on",
    actionTimeout: 45 * 1000,
    baseURL: baseUrl,
    headless: process.env.CI ? true : false,
    trace: "on",
    viewport: process.env.CI ? { width: 1920, height: 1080 } : null,
    launchOptions: {
      args: ["--window-size=1920,1080", "--disable-resizable"],
    },
  },

  projects: [
    {
      name: "Setup",
      testMatch: "**/*.setup.spec.ts",
    },
    {
      name: "Chromium",
      testIgnore: ["**/*.setup.spec.ts"],
      dependencies: ["Setup"],
      use: {
        userAgent: devices["Desktop Chrome"].userAgent,
        viewport: process.env.CI ? { width: 1920, height: 1080 } : null,
        launchOptions: {
          args: ["--window-size=1920,1080", "--disable-resizable"],
        },
      },
    },
    {
      name: "Template",
      testMatch: ["**/Template/**/*.spec.ts"],
      use: {
        userAgent: devices["Desktop Chrome"].userAgent,
        viewport: process.env.CI ? { width: 1920, height: 1080 } : null,
        launchOptions: {
          args: ["--window-size=1920,1080", "--disable-resizable"],
        },
      },
    },
    // Uncomment and configure if needed
    // {
    //   name: "firefox",
    //   use: {
    //     ...devices["Desktop Firefox"],
    //   },
    // },
    // {
    //   name: "webkit",
    //   use: {
    //     ...devices["Desktop Safari"],
    //   },
    // },
  ],
};

export default config;