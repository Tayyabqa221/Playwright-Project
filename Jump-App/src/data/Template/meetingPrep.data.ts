import { MeetingPrepTestCaseData } from "@interfaces/Template/meetingPrep.interface";
import { getEnvVariable } from "@utilities/env.utils";

const meetingPrepTestData: { [key: string]: MeetingPrepTestCaseData } = {
  "create-meeting-prep-template": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @template @meetingPrep @createMeetingPrepTemplate",
      testCase: "TC-JUMPAPP-033",
      testDescription:
        "Create a meeting prep template with a random professional name and description, save, and verify the template name.",
      testSummary:
        "Templates -> New template -> random name/description -> save -> click template -> verify name.",
    },
    templateNames: [
      "Client Portfolio Review",
      "Quarterly Financial Planning",
      "Retirement Strategy Brief",
      "Wealth Management Summary",
      "Investment Advisory Prep",
    ],
    descriptions: [
      "Summarize the client's financial goals, investment timeline, and risk tolerance.",
      "Outline recent portfolio performance, allocation changes, and recommended next steps.",
      "Capture retirement readiness, income needs, and estate planning priorities.",
      "Review short-term liquidity needs and long-term wealth preservation objectives.",
      "Document action items from the prior meeting and outstanding follow-up requests.",
    ],
  },
  "duplicate-meeting-prep-template": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @template @meetingPrep @duplicateMeetingPrepTemplate",
      testCase: "TC-JUMPAPP-034",
      testDescription:
        "Create a meeting prep template, duplicate it from the templates list, and verify the duplicated template.",
      testSummary:
        "Templates -> create template -> duplicate icon -> verify duplicated template toast and copy.",
    },
    templateNames: [
      "Client review meeting",
      "Portfolio planning session",
      "Retirement review meeting",
      "Wealth advisory briefing",
      "Quarterly client check-in",
    ],
    descriptions: [
      "Prepare talking points for the upcoming client review meeting.",
      "Summarize portfolio updates and recommended allocation changes.",
      "Review retirement goals, income needs, and next-step actions.",
      "Capture advisory notes and follow-up items for the client meeting.",
      "Outline agenda items and key discussion topics for the session.",
    ],
  },
  "edit-meeting-prep-template": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @template @meetingPrep @editMeetingPrepTemplate",
      testCase: "TC-JUMPAPP-035",
      testDescription:
        "Create a meeting prep template, edit it from the templates list, update the name and description, save, and verify the updated name.",
      testSummary:
        "Templates -> create template -> edit icon -> update name/description -> save -> verify updated name.",
    },
    templateNames: [
      "Client report",
      "Annual review prep",
      "Investment strategy brief",
      "Financial goals summary",
      "Client onboarding prep",
    ],
    descriptions: [
      "Summarize key client details and meeting objectives.",
      "Outline portfolio performance and recommended actions.",
      "Capture retirement planning priorities and next steps.",
      "Document recent client interactions and follow-up items.",
      "Prepare agenda topics for the upcoming client session.",
    ],
    updatedTemplateNames: [
      "Client report for economics",
      "Annual review prep updated",
      "Investment strategy brief revised",
      "Financial goals summary updated",
      "Client onboarding prep revised",
    ],
    updatedDescriptions: [
      "Updated summary covering economic outlook and client portfolio impact.",
      "Revised review notes with latest performance metrics and recommendations.",
      "Updated strategy brief reflecting new allocation targets.",
      "Revised goals summary with updated retirement timeline.",
      "Updated onboarding notes with revised discussion points.",
    ],
  },
  "delete-meeting-prep-template": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @template @meetingPrep @deleteMeetingPrepTemplate",
      testCase: "TC-JUMPAPP-036",
      testDescription:
        "Create a meeting prep template, delete it from the templates list, confirm deletion, and verify the success toast.",
      testSummary:
        "Templates -> create template -> delete icon -> confirm -> verify deleted toast.",
    },
    templateNames: [
      "Client report",
      "Portfolio review prep",
      "Retirement planning brief",
      "Wealth summary prep",
      "Quarterly check-in prep",
    ],
    descriptions: [
      "Prepare notes for the upcoming client report meeting.",
      "Summarize portfolio updates and action items for review.",
      "Capture retirement planning discussion points.",
      "Outline wealth management topics for the session.",
      "Document agenda items for the quarterly client check-in.",
    ],
  },
};

export function getData(testCase: string): MeetingPrepTestCaseData {
  const data = meetingPrepTestData[testCase];
  if (!data) {
    throw new Error(`Test case data not found for: ${testCase}. Add data in data/Template/meetingPrep.data.ts`);
  }
  return data;
}
