import { test } from "@fixtures/mergePage.fixture";
import { getDataSet } from "@utilities/env.utils";
import { logTestCaseData } from "@utilities/test.helper.utils";
import { getStorageStatePath } from "@utilities/storage.state.utils";
const scenario1 = getDataSet("meetings", "meetingsTestData", "meetings-view-toggle");
const scenario2 = getDataSet("meetings", "meetingsTestData", "calendar-settings");
const scenario3 = getDataSet("meetings", "meetingsTestData", "horizontal-navigation");
const scenario4 = getDataSet("meetings", "meetingsTestData", "day-range-selector");
const scenario5 = getDataSet("meetings", "meetingsTestData", "list-view-tabs");
const scenario6 = getDataSet("meetings", "meetingsTestData", "filter");
const scenario7 = getDataSet("meetings", "meetingsTestData", "remove");
const scenario8 = getDataSet("meetings", "meetingsTestData", "make-private");
const scenario9 = getDataSet("meetings", "meetingsTestData", "meeting-type-selector");

test.use({ storageState: getStorageStatePath("jumpappGoogle") });
test.describe("Meetings", () => {
  test(`
  Test case: '${scenario1.testCaseData.testCase}'
    Summary: ${scenario1.testCaseData.testSummary}
    Description: ${scenario1.testCaseData.testDescription}
    Tags: '${scenario1.testCaseData.tags}'
  `, async ({ meetingsPage }) => {
    await logTestCaseData(test.info(), scenario1.testCaseData);
    const { baseUrl } = scenario1;

    await test.step("Open home → Meetings → List view → Calendar view", async () => {
      await meetingsPage.runMeetingsViewToggleFlow(baseUrl);
    });
  });

  test(`
    Test case: '${scenario2.testCaseData.testCase}'
    Summary: ${scenario2.testCaseData.testSummary}
    Description: ${scenario2.testCaseData.testDescription}
    Tags: '${scenario2.testCaseData.tags}'
  `, async ({ meetingsPage }) => {
    await logTestCaseData(test.info(), scenario2.testCaseData);
    const { baseUrl } = scenario2;

    await test.step("Open home → Meetings → Calendar settings", async () => {
      await meetingsPage.runCalendarSettingsFlow(baseUrl);
    });
  });

  test(`
    Test case: '${scenario3.testCaseData.testCase}'
    Summary: ${scenario3.testCaseData.testSummary}
    Description: ${scenario3.testCaseData.testDescription}
    Tags: '${scenario3.testCaseData.tags}'
  `, async ({ meetingsPage }) => {
    await logTestCaseData(test.info(), scenario3.testCaseData);
    const { baseUrl } = scenario3;

    await test.step("Horizontal Navigation: Meetings → Calendar → forward → Today → backward → Today", async () => {
      await meetingsPage.runHorizontalNavigationFlow(baseUrl);
    });
  });

  test(`
    Test case: '${scenario4.testCaseData.testCase}'
    Summary: ${scenario4.testCaseData.testSummary}
    Description: ${scenario4.testCaseData.testDescription}
    Tags: '${scenario4.testCaseData.tags}'
  `, async ({ meetingsPage }) => {
    await logTestCaseData(test.info(), scenario4.testCaseData);
    const { baseUrl } = scenario4;

    await test.step("Day Range Selector: open dropdown → 3 days → Week → Show weekend", async () => {
      await meetingsPage.runDayRangeSelectorFlow(baseUrl);
    });
  });

  test(`
      Test case: '${scenario5.testCaseData.testCase}'
    Summary: ${scenario5.testCaseData.testSummary}
    Description: ${scenario5.testCaseData.testDescription}
    Tags: '${scenario5.testCaseData.tags}'
  `, async ({ meetingsPage }) => {
    await logTestCaseData(test.info(), scenario5.testCaseData);
    const { baseUrl } = scenario5;

    await test.step("List View tabs: Upcoming → All past → AI-processed → Needs Action", async () => {
      await meetingsPage.runListViewTabsFlow(baseUrl);
    });
  });

  test(`
    Test case: '${scenario6.testCaseData.testCase}'
    Summary: ${scenario6.testCaseData.testSummary}
    Description: ${scenario6.testCaseData.testDescription}
    Tags: '${scenario6.testCaseData.tags}'
  `, async ({ meetingsPage }) => {
    await logTestCaseData(test.info(), scenario6.testCaseData);
    const { baseUrl } = scenario6;

    await test.step("Filter: All past → Archived (on/off) → Missed (on/off)", async () => {
      await meetingsPage.runFilterFlow(baseUrl);
    });
  });

  test(`
    Test case: '${scenario7.testCaseData.testCase}'
    Summary: ${scenario7.testCaseData.testSummary}
    Description: ${scenario7.testCaseData.testDescription}
    Tags: '${scenario7.testCaseData.tags}'
  `, async ({ meetingsPage }) => {
    await logTestCaseData(test.info(), scenario7.testCaseData);
    const { baseUrl } = scenario7;

    await test.step("Remove: List view → Upcoming → 3-dot → Remove → Yes, delete → toast", async () => {
      const ran = await meetingsPage.runRemoveFlow(baseUrl);
      if (!ran) {
        test.skip(true, "No upcoming meetings — skipping Remove test");
      }
    });
  });

  test(`
      Test case: '${scenario8.testCaseData.testCase}'
    Summary: ${scenario8.testCaseData.testSummary}
    Description: ${scenario8.testCaseData.testDescription}
    Tags: '${scenario8.testCaseData.tags}'
  `, async ({ meetingsPage }) => {
    await logTestCaseData(test.info(), scenario8.testCaseData);
    const { baseUrl } = scenario8;

    await test.step("Make Private: List view → Upcoming → 3-dot → Make Private → verify label → Make Public → verify label gone", async () => {
      const ran = await meetingsPage.runMakePrivateFlow(baseUrl);
      if (!ran) {
        test.skip(true, "No upcoming meetings — skipping Make Private test");
      }
    });
  });

  test(`
  Test case: '${scenario9.testCaseData.testCase}'
    Summary: ${scenario9.testCaseData.testSummary}
    Description: ${scenario9.testCaseData.testDescription}
    Tags: '${scenario9.testCaseData.tags}'
  `, async ({ meetingsPage }) => {
    await logTestCaseData(test.info(), scenario9.testCaseData);
    const { baseUrl } = scenario9;

    await test.step("Meeting Type Selector: List view → Upcoming → click selector on first card → select random type", async () => {
      const ran = await meetingsPage.runMeetingTypeSelectorFlow(baseUrl);
      if (!ran) {
        test.skip(true, "No upcoming meetings — skipping Meeting Type Selector test");
      }
    });
  });
});

