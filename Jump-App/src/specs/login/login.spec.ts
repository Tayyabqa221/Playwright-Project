import path from "node:path";
import { test } from "@fixtures/mergePage.fixture";
import { getDataSet } from "@utilities/env.utils";
import { logTestCaseData } from "@utilities/test.helper.utils";
import { getStorageStatePath } from "@utilities/storage.state.utils";

const scenario = getDataSet(
  "login",
  "loginTestData",
  "Login-001"
) ;
test.describe("Jump App: Login", () => {

  test(`
    Test case: '${scenario.testCaseData.testCase}'
    Summary: ${scenario.testCaseData.testSummary}
    Description: ${scenario.testCaseData.testDescription}
    Tags: '${scenario.testCaseData.tags}'
  `, async ({ loginPage }) => {
    test.setTimeout(180_000);
    await logTestCaseData(test.info(), scenario.testCaseData);
    const twoFactorSecret = process.env.JUMPAPP_2FA_SECRET;
    await test.step("GIVEN the user navigates to Jump App login page", async () => {
      await loginPage.navigateToLoginPage(scenario.baseUrl);
    });
    await test.step("WHEN the user logs in with Google and optional 2FA", async () => {
      await loginPage.loginWithGoogle(
        scenario.loginData.email,
        scenario.loginData.password,
        twoFactorSecret,
        scenario.baseUrl
      );
    });
    await test.step("AND the app has finished loading (not on login page)", async () => {
      await loginPage.waitForAppHome(scenario.baseUrl);
    });

    await test.step("AND the authenticated app UI is visible", async () => {
      await loginPage.waitForAuthenticatedUI();
    });

    await test.step("THEN the user saves auth state for downstream tests", async () => {
      const relativePath = getStorageStatePath("jumpappGoogle").replace(/^\.\//, "");
      const absolutePath = path.resolve(process.cwd(), relativePath);
      await loginPage.storeBrowserStorageState(absolutePath);
    });
  });
});
