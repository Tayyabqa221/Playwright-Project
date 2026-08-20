import path from "node:path";
import { test } from "@fixtures/mergePage.fixture";
import { getDataSet } from "@utilities/env.utils";
import { getStorageStatePath } from "@utilities/storage.state.utils";
const scenario = getDataSet("login", "loginTestData", "Login-001");

test.describe("Setup Auth State", () => {
  test("create authenticated storage state for downstream tests", async ({ loginPage }) => {
    test.setTimeout(180_000);
    const twoFactorSecret = process.env.JUMPAPP_2FA_SECRET?.trim();
    if (!twoFactorSecret) {
      throw new Error(
        "JUMPAPP_2FA_SECRET is missing. Add your Google Authenticator secret to src/config/.env.staging"
      );
    }

    await loginPage.navigateToLoginPage(scenario.baseUrl);
    await loginPage.loginWithGoogle(
      scenario.loginData.email,
      scenario.loginData.password,
      twoFactorSecret,
      scenario.baseUrl
    );
    await loginPage.waitForAppHome(scenario.baseUrl);
    await loginPage.waitForAuthenticatedUI();

    const relativePath = getStorageStatePath("jumpappGoogle").replace(/^\.\//, "");
    const absolutePath = path.resolve(process.cwd(), relativePath);
    await loginPage.storeBrowserStorageState(absolutePath);
  });
});
