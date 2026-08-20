import { test } from "@fixtures/mergePage.fixture";
import { getEnvVariable } from "@utilities/env.utils";
import { getStorageStatePath } from "@utilities/storage.state.utils";

test.use({ storageState: getStorageStatePath("jumpappGoogle") }); 

// Placeholder for JumpApp automation
test.describe("Auth: Logout", () => {
  test("placeholder - add JumpApp logout tests", async ({ loginPage, page }) => {

    await test.step("GIVEN the user is logged in", async () => {
      await loginPage.navigateToLoginPage(getEnvVariable("JUMPAPP_BASE_URL"));
      await page.waitForTimeout(5000);

    });
  });
});
