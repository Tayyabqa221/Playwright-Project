import { test } from "@fixtures/mergePage.fixture";
import { getDataSet } from "@utilities/env.utils";
import { getStorageStatePath } from "@utilities/storage.state.utils";
import { logTestCaseData } from "@utilities/test.helper.utils";
const scenario1 = getDataSet("home", "homeTestData", "private-meeting");
const scenario2 = getDataSet("home", "homeTestData", "open-meeting-detail-view");
const scenario3 = getDataSet("home", "homeTestData", "view-all-upcoming-meetings");
test.use({ storageState: getStorageStatePath("jumpappGoogle") });
test.describe("Home", () => {
  test(`
    Test case: '${scenario1.testCaseData.testCase}'
    Summary: ${scenario1.testCaseData.testSummary}
    Description: ${scenario1.testCaseData.testDescription}
    Tags: '${scenario1.testCaseData.tags}'
  `, async ({ homePage }) => {
    await logTestCaseData(test.info(), scenario1.testCaseData);
    const { baseUrl } = scenario1;

    await test.step("Home → Private meeting flow (or pass when No meetings scheduled)", async () => {
      await homePage.runPrivateMeetingFlow(baseUrl);
    });
  });

  test(`
    Test case: '${scenario2.testCaseData.testCase}'
    Summary: ${scenario2.testCaseData.testSummary}
    Description: ${scenario2.testCaseData.testDescription}
    Tags: '${scenario2.testCaseData.tags}'
  `, async ({ homePage }) => {
    await logTestCaseData(test.info(), scenario2.testCaseData);
    const { baseUrl } = scenario2;

    await homePage.navigateToHome(baseUrl);
    const noMeetings = await homePage.isNoMeetingsScheduledVisible(5000);
    if (noMeetings) {
      test.skip(true, "No meetings in Today's meetings — skipping Open Meeting Detail View");
      return;
    }

    await test.step("Click first meeting and verify navigation to meeting detail URL", async () => {
      await homePage.clickFirstMeeting();
      await homePage.expectMeetingDetailUrl(baseUrl);
    });
  });

  test(`
    Test case: '${scenario3.testCaseData.testCase}'
    Summary: ${scenario3.testCaseData.testSummary}
    Description: ${scenario3.testCaseData.testDescription}
    Tags: '${scenario3.testCaseData.tags}'
  `, async ({ homePage }) => {
    await logTestCaseData(test.info(), scenario3.testCaseData);
    const { baseUrl } = scenario3;

    await homePage.navigateToHome(baseUrl);
    const viewAllVisible = await homePage.isViewAllUpcomingMeetingsVisible(5000);
    if (!viewAllVisible) {
      test.skip(true, "View all Upcoming meetings button not present — skipping");
      return;
    }

    await test.step("Click View all Upcoming meetings and verify navigation to /meetings?filter=upcoming", async () => {
      await homePage.clickViewAllUpcomingMeetings();
      await homePage.expectUpcomingMeetingsUrl(baseUrl);
    });
  });
});
