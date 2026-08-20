import { AgendaTestCaseData } from "@interfaces/Template/agenda.interface";
import { getEnvVariable } from "@utilities/env.utils";

const agendaTestData: { [key: string]: AgendaTestCaseData } = {
  "create-agenda-template": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @template @agenda @createAgendaTemplate",
      testCase: "TC-JUMPAPP-041",
      testDescription:
        "Create an agenda template with name and description, save, and verify the template name.",
      testSummary:
        "Templates -> Agendas -> create template (name + description) -> save -> click template -> verify name.",
    },
    templateNames: [
      "Client Review Agenda",
      "Quarterly Planning Agenda",
      "Portfolio Discussion Agenda",
      "Retirement Planning Agenda",
      "Wealth Advisory Agenda",
    ],
    descriptions: [
      "Template for client review and meeting preparation.",
      "Template for quarterly planning and goal discussion.",
      "Template for portfolio review and allocation updates.",
      "Template for retirement planning client sessions.",
      "Template for wealth advisory client meetings.",
    ],
    sectionInformation: [
      "Key discussion topics for client portfolio performance and next steps.",
      "Review quarterly goals, market outlook, and recommended actions.",
      "Outline portfolio updates, risk review, and client decisions.",
      "Cover retirement readiness, income planning, and follow-up items.",
      "Summarize advisory topics, client priorities, and action items.",
    ],
  },
  "duplicate-agenda-template": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @template @agenda @duplicateAgendaTemplate",
      testCase: "TC-JUMPAPP-043",
      testDescription:
        "Create an agenda template, duplicate it from the templates list, and verify the duplicated template name.",
      testSummary:
        "Templates -> Agendas -> create template -> duplicate icon -> verify duplicated template toast and copy.",
    },
    templateNames: [
      "Client review agenda",
      "Quarterly planning agenda",
      "Portfolio discussion agenda",
      "Retirement planning agenda",
      "Wealth advisory agenda",
    ],
    descriptions: [
      "Template for client review and meeting preparation.",
      "Template for quarterly planning and goal discussion.",
      "Template for portfolio review and allocation updates.",
      "Template for retirement planning client sessions.",
      "Template for wealth advisory client meetings.",
    ],
    sectionInformation: [
      "Key discussion topics for client portfolio performance and next steps.",
      "Review quarterly goals, market outlook, and recommended actions.",
      "Outline portfolio updates, risk review, and client decisions.",
      "Cover retirement readiness, income planning, and follow-up items.",
      "Summarize advisory topics, client priorities, and action items.",
    ],
  },
  "delete-agenda-template": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @template @agenda @deleteAgendaTemplate",
      testCase: "TC-JUMPAPP-044",
      testDescription:
        "Create an agenda template, verify the template name in the list, delete it, and verify the success toast.",
      testSummary:
        "Templates -> Agendas -> create template -> verify name in list -> delete icon -> confirm -> verify deleted toast.",
    },
    templateNames: [
      "Client review agenda",
      "Quarterly planning agenda",
      "Portfolio discussion agenda",
      "Retirement planning agenda",
      "Wealth advisory agenda",
    ],
    descriptions: [
      "Template for client review and meeting preparation.",
      "Template for quarterly planning and goal discussion.",
      "Template for portfolio review and allocation updates.",
      "Template for retirement planning client sessions.",
      "Template for wealth advisory client meetings.",
    ],
    sectionInformation: [
      "Key discussion topics for client portfolio performance and next steps.",
      "Review quarterly goals, market outlook, and recommended actions.",
      "Outline portfolio updates, risk review, and client decisions.",
      "Cover retirement readiness, income planning, and follow-up items.",
      "Summarize advisory topics, client priorities, and action items.",
    ],
  },
  "edit-agenda-template": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @template @agenda @editAgendaTemplate",
      testCase: "TC-JUMPAPP-042",
      testDescription:
        "Create an agenda template, edit name and description from the templates list, save, and verify the updated template.",
      testSummary:
        "Templates -> Agendas -> create template -> edit icon -> update name/description -> save -> verify edited template.",
    },
    templateNames: [
      "Client review agenda",
      "Quarterly planning agenda",
      "Portfolio discussion agenda",
      "Retirement planning agenda",
      "Wealth advisory agenda",
    ],
    descriptions: [
      "Template for client review and meeting preparation.",
      "Template for quarterly planning and goal discussion.",
      "Template for portfolio review and allocation updates.",
      "Template for retirement planning client sessions.",
      "Template for wealth advisory client meetings.",
    ],
    sectionInformation: [
      "Key discussion topics for client portfolio performance and next steps.",
      "Review quarterly goals, market outlook, and recommended actions.",
      "Outline portfolio updates, risk review, and client decisions.",
      "Cover retirement readiness, income planning, and follow-up items.",
      "Summarize advisory topics, client priorities, and action items.",
    ],
    updatedTemplateNames: [
      "Client review agenda updated",
      "Quarterly planning agenda revised",
      "Portfolio discussion agenda updated",
      "Retirement planning agenda revised",
      "Wealth advisory agenda updated",
    ],
    updatedDescriptions: [
      "Updated template for client review with revised discussion topics.",
      "Updated template for quarterly planning and updated goal alignment.",
      "Updated template for portfolio review and new allocation targets.",
      "Updated template for retirement planning with revised priorities.",
      "Updated template for wealth advisory with new client objectives.",
    ],
  },
};

export function getData(testCase: string): AgendaTestCaseData {
  const data = agendaTestData[testCase];
  if (!data) {
    throw new Error(`Test case data not found for: ${testCase}. Add data in data/Template/agenda.data.ts`);
  }
  return data;
}
