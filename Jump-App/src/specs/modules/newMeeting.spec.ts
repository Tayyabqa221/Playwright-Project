import { test } from "@fixtures/mergePage.fixture";
import { faker } from "@faker-js/faker";
import { getDataSet } from "@utilities/env.utils";
import { logTestCaseData } from "@utilities/test.helper.utils";
import { getStorageStatePath } from "@utilities/storage.state.utils";
const scenario1 = getDataSet("newMeeting", "newMeetingTestData", "upload-meeting-audio");
const scenario2 = getDataSet("newMeeting", "newMeetingTestData", "send-notetaker-to-meeting");
const scenario3 = getDataSet("newMeeting", "newMeetingTestData", "join-my-call");
const scenario4 = getDataSet("newMeeting", "newMeetingTestData", "capture-meeting-now");
const scenario5 = getDataSet("newMeeting", "newMeetingTestData", "booking-window-weekly");
const scenario6 = getDataSet("newMeeting", "newMeetingTestData", "booking-window-do-not-repeat");


test.use({ storageState: getStorageStatePath("jumpappGoogle") });
test.describe("New Meeting", () => {
  test(`
   Test case: '${scenario1.testCaseData.testCase}'
    Summary: ${scenario1.testCaseData.testSummary}
    Description: ${scenario1.testCaseData.testDescription}
    Tags: '${scenario1.testCaseData.tags}'
  `, async ({ newMeetingPage }) => {
    test.setTimeout(360000);
    await logTestCaseData(test.info(), scenario1.testCaseData);

    await newMeetingPage.createMeetingWithUploadedAudio(
      scenario1.baseUrl,
      scenario1.uploadFilePath!,
      scenario1.meetingUrl
    );
  });
  test(`
    Test case: '${scenario2.testCaseData.testCase}'
    Summary: ${scenario2.testCaseData.testSummary}
    Description: ${scenario2.testCaseData.testDescription}
    Tags: '${scenario2.testCaseData.tags}'
  `, async ({ newMeetingPage }) => {
    await logTestCaseData(test.info(), scenario2.testCaseData);
    await test.step("Open New meeting → Send notetaker to meeting, fill URL and submit", async () => {
      await newMeetingPage.sendNotetakerToMeeting(scenario2.baseUrl, scenario2.meetingUrl);
    });
    await test.step("Verify success toast: Your notetaker should be joining the meeting now", async () => {
      await newMeetingPage.waitForNotetakerToast(15000);
    });
  });

  test(`
    Test case: '${scenario3.testCaseData.testCase}'
    Summary: ${scenario3.testCaseData.testSummary}
    Description: ${scenario3.testCaseData.testDescription}
    Tags: '${scenario3.testCaseData.tags}'
  `, async ({ newMeetingPage }) => {
    await logTestCaseData(test.info(), scenario3.testCaseData);
    const { baseUrl, phoneNumber, ext, nickname } = scenario3;

    await test.step("New meeting → Join my call → fill Phone, Ext, Nickname → Call now and verify toast", async () => {
      await newMeetingPage.joinMyCallAndVerifyToast(baseUrl, phoneNumber, ext, nickname);
    });
  });

  test(`
    Test case: '${scenario4.testCaseData.testCase}'
    Summary: ${scenario4.testCaseData.testSummary}
    Description: ${scenario4.testCaseData.testDescription}
    Tags: '${scenario4.testCaseData.tags}'
  `, async ({ newMeetingPage }) => {
    await logTestCaseData(test.info(), scenario4.testCaseData);
    const { baseUrl } = scenario4;

    await test.step("New meeting → Capture meeting now → wait for Meeting captured label", async () => {
      await newMeetingPage.captureMeetingNowAndVerifyMeetingCaptured(baseUrl);
    });
  });

  test(`
    Test case: '${scenario5.testCaseData.testCase}'
    Summary: ${scenario5.testCaseData.testSummary}
    Description: ${scenario5.testCaseData.testDescription}
    Tags: '${scenario5.testCaseData.tags}'
  `, async ({ newMeetingPage, homePage }) => {
    await logTestCaseData(test.info(), scenario5.testCaseData);
    const { baseUrl } = scenario5;
    const bookingWindowName = `${faker.company.name()} Weekly`;

    await test.step("New meeting → Weekly booking window → Done → No thanks → Cancel", async () => {
      await newMeetingPage.createBookingWindowWeekly(baseUrl, bookingWindowName);
    });
    await test.step("Home → bottom of page → verify booking window name", async () => {
      await homePage.navigateToHome(baseUrl);
      await homePage.expectBookingWindowNameVisibleAtPageBottom(bookingWindowName);
    });
  });

  test(`
    Test case: '${scenario6.testCaseData.testCase}'
    Summary: ${scenario6.testCaseData.testSummary}
    Description: ${scenario6.testCaseData.testDescription}
    Tags: '${scenario6.testCaseData.tags}'
  `, async ({ newMeetingPage }) => {
    await logTestCaseData(test.info(), scenario6.testCaseData);
    const { baseUrl } = scenario6;
    const bookingWindowName = `${faker.company.name()} Do Not Repeat`;

    await test.step("New meeting → Create Booking Window Do not repeat → name, Video Google, Done, Close", async () => {
      await newMeetingPage.createBookingWindowDoNotRepeat(baseUrl, bookingWindowName);
    });
  });
});
