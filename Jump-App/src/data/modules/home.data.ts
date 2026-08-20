import { HomeTestCaseData } from "@interfaces/modules/home.interface";

const homeTestData: { [key: string]: HomeTestCaseData } = {
  "private-meeting": {
    baseUrl: process.env.JUMPAPP_BASE_URL || "https://staging.jumpapp.dev/",
    testCaseData: {
      tags: "@smoke @home @privateMeeting",
      testCase: "TC-JUMPAPP-008",
      testDescription: "Home → Today's meetings: Make Private then Make Public or pass when no meetings",
      testSummary:
        "Home → Private meeting: if already private → once Make Public (assert Private label gone) → once Make Private → verify Private Event; if already public → Make Private → verify; then teardown Make Public / label gone; or pass when No meetings scheduled",
    },
  },
  "open-meeting-detail-view": {
    baseUrl: process.env.JUMPAPP_BASE_URL || "https://staging.jumpapp.dev/",
    testCaseData: {
      tags: "@smoke @home @openMeetingDetailView",
      testCase: "TC-JUMPAPP-009",
      testDescription: "Home → Open Meeting Detail View: click first meeting, verify URL /meetings/mtg_...",
      testSummary: "Home → click first meeting in Today's meetings → verify navigates to /meetings/mtg_; skip if no meetings",
    },
  },
  "view-all-upcoming-meetings": {
    baseUrl: process.env.JUMPAPP_BASE_URL || "https://staging.jumpapp.dev/",
    testCaseData: {
      tags: "@smoke @home @viewAllUpcomingMeetings",
      testCase: "TC-JUMPAPP-010",
      testDescription: "Home → View all Upcoming meetings: click button, verify URL /meetings?filter=upcoming",
      testSummary: "Home → click View all Upcoming meetings → verify navigates to /meetings?filter=upcoming; skip if no button",
    },
  },
};

export function getData(testCase: string): HomeTestCaseData {
  const data = homeTestData[testCase];
  if (!data) {
    throw new Error(`Test case data not found for: ${testCase}. Add data in data/modules/home.data.ts`);
  }
  return data;
}
