import { MeetingsTestCaseData } from "@interfaces/modules/meetings.interface";
import { getEnvVariable } from "@utilities/env.utils";

const meetingsTestData: { [key: string]: MeetingsTestCaseData } = {
  "meetings-view-toggle": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @meetings @meetingsViewToggle",
      testCase: "TC-JUMPAPP-011",
      testDescription: "Open home → Meetings → toggle to List view then back to Calendar view",
      testSummary: "Open staging.jumpapp.dev → click Meetings → /meetings → click List view → click Calendar view",
    },
  },
  "calendar-settings": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @meetings @calendarSettings",
      testCase: "TC-JUMPAPP-012",
      testDescription: "Meetings → Calendar settings → verify settings page",
      testSummary: "Open home → click Meetings → click Calendar settings → verify URL /settings/user?tab=preferences#calendars_section",
    },
  },
  "horizontal-navigation": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @meetings @horizontalNavigation",
      testCase: "TC-JUMPAPP-013",
      testDescription: "Meetings → Calendar view → forward → Today → red line & green marker → backward → Today → red line & green marker",
      testSummary: "Home → Meetings → Calendar view → forward → Today → verify red line & green marker → backward → Today → verify red line & green marker",
    },
  },
  "day-range-selector": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @meetings @dayRangeSelector",
      testCase: "TC-JUMPAPP-014",
      testDescription: "Meetings → Calendar view → Day range dropdown: 3 days, Week, Show weekend",
      testSummary: "Home → Meetings → Calendar view → open day range → 3 days → Week → Show weekend (wait 2s between each), wait 2s end",
    },
  },
  "list-view-tabs": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @meetings @listViewTabs",
      testCase: "TC-JUMPAPP-015",
      testDescription: "Meetings → List view → Upcoming, All past, AI-processed, Needs Action tabs (verify URL each)",
      testSummary: "Home → Meetings → List view → click Upcoming/All past/AI-processed/Needs Action, wait 1s and verify URL each",
    },
  },
  "filter": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @meetings @filter",
      testCase: "TC-JUMPAPP-016",
      testDescription: "Meetings → List view → All past → Filter: Archived meetings (on/off), Missed meetings (on/off), verify URLs",
      testSummary: "Home → Meetings → List view → All past → Filter → Archived (verify) → Archived again (verify) → Missed (verify) → Missed again (verify)",
    },
  },
  "remove": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @meetings @remove",
      testCase: "TC-JUMPAPP-017",
      testDescription: "Meetings → List view → Upcoming → 3-dot on first meeting → Remove → Yes, delete → verify Meeting removed toast",
      testSummary: "Home → Meetings → List view → Upcoming → 3-dot on top meeting → Remove → Yes, delete → toast Meeting removed",
    },
  },
  "make-private": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @meetings @makePrivate",
      testCase: "TC-JUMPAPP-018",
      testDescription: "Meetings → List view → Upcoming → 3-dot → Make Private → verify Private label → Make Public → verify label gone",
      testSummary: "Home → Meetings → List view → Upcoming → 3-dot on first meeting → Make Private → (modal if recurring) → verify Private Event → Make Public → verify label gone; skip if no meetings",
    },
  },
  "meeting-type-selector": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @meetings @meetingTypeSelector",
      testCase: "TC-JUMPAPP-019",
      testDescription: "Meetings → List view → Upcoming → on first meeting card click Meeting Type Selector → select random meeting type",
      testSummary: "Home → Meetings → List view → Upcoming → click Meeting Selector on top card → select random type from dropdown; skip if no meetings",
    },
  },
};

export function getData(testCase: string): MeetingsTestCaseData {
  const data = meetingsTestData[testCase];
  if (!data) {
    throw new Error(`Test case data not found for: ${testCase}. Add data in data/modules/meetings.data.ts`);
  }
  return data;
}
