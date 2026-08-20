import { MeetingNotesTestCaseData } from "@interfaces/Template/meetingNotes.interface";
import { getEnvVariable } from "@utilities/env.utils";

const meetingNotesTestData: { [key: string]: MeetingNotesTestCaseData } = {
  "create-meeting-notes-template": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @template @meetingNotes @createMeetingNotesTemplate",
      testCase: "TC-JUMPAPP-037",
      testDescription:
        "Create a meeting notes template with random name, instructions, and example, save, and verify the template name.",
      testSummary:
        "Templates -> Meeting Notes -> new template -> random name -> random instructions/example -> save -> go to template -> verify name.",
    },
    templateNames: [
      "Client Meeting Notes",
      "Quarterly Review Notes",
      "Advisory Session Summary",
      "Portfolio Discussion Notes",
      "Financial Planning Notes",
    ],
    descriptions: [
      "Capture key discussion points and action items from the client meeting.",
      "Summarize portfolio performance updates and client decisions.",
      "Document retirement planning topics and follow-up tasks.",
      "Record investment recommendations and client feedback.",
      "Outline meeting agenda outcomes and next steps for the client.",
    ],
    instructions: [
      "Summarize the meeting in clear sections: attendees, topics discussed, decisions made, and action items.",
      "Use bullet points for key takeaways and numbered lists for follow-up tasks with owners.",
      "Include a brief executive summary at the top followed by detailed notes per agenda item.",
      "Highlight any changes to the client's financial goals or risk tolerance discussed during the meeting.",
      "Format notes with headings for each topic and include relevant dates for scheduled follow-ups.",
    ],
    examples: [
      "Meeting with John Smith on 03/15/2026. Discussed portfolio rebalancing. Action: Send updated allocation proposal by Friday.",
      "Quarterly review with the Anderson family. Reviewed Q1 performance (+4.2%). Agreed to increase bond allocation by 5%.",
      "Retirement planning session. Client confirmed target retirement age of 62. Next step: Run updated Monte Carlo analysis.",
      "Investment advisory call. Client approved moving $50K to diversified ETF portfolio. Compliance review pending.",
      "Financial planning meeting. Updated estate planning priorities. Schedule follow-up with attorney by end of month.",
    ],
  },
  "duplicate-meeting-notes-template": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @template @meetingNotes @duplicateMeetingNotesTemplate",
      testCase: "TC-JUMPAPP-038",
      testDescription:
        "Create a meeting notes template, duplicate it from the templates list, and verify the duplicated template.",
      testSummary:
        "Templates -> Meeting Notes -> create template -> duplicate icon -> verify duplicated template toast and copy.",
    },
    templateNames: [
      "Client review notes",
      "Portfolio meeting notes",
      "Retirement session notes",
      "Wealth advisory notes",
      "Quarterly client notes",
    ],
    descriptions: [
      "Capture key discussion points and action items from the client meeting.",
      "Summarize portfolio performance updates and client decisions.",
      "Document retirement planning topics and follow-up tasks.",
      "Record investment recommendations and client feedback.",
      "Outline meeting agenda outcomes and next steps for the client.",
    ],
    instructions: [
      "Summarize the meeting in clear sections: attendees, topics discussed, decisions made, and action items.",
      "Use bullet points for key takeaways and numbered lists for follow-up tasks with owners.",
      "Include a brief executive summary at the top followed by detailed notes per agenda item.",
      "Highlight any changes to the client's financial goals or risk tolerance discussed during the meeting.",
      "Format notes with headings for each topic and include relevant dates for scheduled follow-ups.",
    ],
    examples: [
      "Meeting with John Smith on 03/15/2026. Discussed portfolio rebalancing. Action: Send updated allocation proposal by Friday.",
      "Quarterly review with the Anderson family. Reviewed Q1 performance (+4.2%). Agreed to increase bond allocation by 5%.",
      "Retirement planning session. Client confirmed target retirement age of 62. Next step: Run updated Monte Carlo analysis.",
      "Investment advisory call. Client approved moving $50K to diversified ETF portfolio. Compliance review pending.",
      "Financial planning meeting. Updated estate planning priorities. Schedule follow-up with attorney by end of month.",
    ],
  },
  "edit-meeting-notes-template": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @template @meetingNotes @editMeetingNotesTemplate",
      testCase: "TC-JUMPAPP-039",
      testDescription:
        "Create a meeting notes template, edit it from the templates list, update name/instructions/example, save, and verify the updated template.",
      testSummary:
        "Templates -> Meeting Notes -> create template -> edit icon -> update all info -> save -> go to meeting notes -> verify name.",
    },
    templateNames: [
      "Client report notes",
      "Annual review notes",
      "Investment strategy notes",
      "Financial goals notes",
      "Client onboarding notes",
    ],
    descriptions: [
      "Capture key discussion points and action items from the client meeting.",
      "Summarize portfolio performance updates and client decisions.",
      "Document retirement planning topics and follow-up tasks.",
      "Record investment recommendations and client feedback.",
      "Outline meeting agenda outcomes and next steps for the client.",
    ],
    instructions: [
      "Summarize the meeting in clear sections: attendees, topics discussed, decisions made, and action items.",
      "Use bullet points for key takeaways and numbered lists for follow-up tasks with owners.",
      "Include a brief executive summary at the top followed by detailed notes per agenda item.",
      "Highlight any changes to the client's financial goals or risk tolerance discussed during the meeting.",
      "Format notes with headings for each topic and include relevant dates for scheduled follow-ups.",
    ],
    examples: [
      "Meeting with John Smith on 03/15/2026. Discussed portfolio rebalancing. Action: Send updated allocation proposal by Friday.",
      "Quarterly review with the Anderson family. Reviewed Q1 performance (+4.2%). Agreed to increase bond allocation by 5%.",
      "Retirement planning session. Client confirmed target retirement age of 62. Next step: Run updated Monte Carlo analysis.",
      "Investment advisory call. Client approved moving $50K to diversified ETF portfolio. Compliance review pending.",
      "Financial planning meeting. Updated estate planning priorities. Schedule follow-up with attorney by end of month.",
    ],
    updatedTemplateNames: [
      "Client report notes updated",
      "Annual review notes revised",
      "Investment strategy notes updated",
      "Financial goals notes revised",
      "Client onboarding notes updated",
    ],
    updatedInstructions: [
      "Updated summary covering economic outlook, portfolio impact, and revised action items.",
      "Revised review notes with latest performance metrics, allocation changes, and follow-ups.",
      "Updated strategy notes reflecting new retirement timeline and income targets.",
      "Revised goals notes with updated risk tolerance and investment recommendations.",
      "Updated onboarding notes with revised discussion points and next meeting agenda.",
    ],
    updatedExamples: [
      "Updated meeting with John Smith on 04/01/2026. Rebalanced portfolio to 60/40. Action: Send compliance summary.",
      "Updated quarterly review. Q2 performance (+3.1%). Client approved 10% increase in equity allocation.",
      "Updated retirement session. Client moved target retirement to age 63. Next step: Update income projection.",
      "Updated advisory call. Client approved $75K transfer to ETF portfolio. Schedule compliance review.",
      "Updated planning meeting. Estate planning attorney meeting scheduled for next month.",
    ],
  },
  "delete-meeting-notes-template": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @template @meetingNotes @deleteMeetingNotesTemplate",
      testCase: "TC-JUMPAPP-040",
      testDescription:
        "Create a meeting notes template, delete it from the templates list, confirm deletion, and verify the success toast.",
      testSummary:
        "Templates -> Meeting Notes -> create template -> delete icon -> confirm -> verify deleted toast.",
    },
    templateNames: [
      "Client summary notes",
      "Portfolio review notes",
      "Retirement planning notes",
      "Wealth management notes",
      "Quarterly meeting notes",
    ],
    descriptions: [
      "Capture key discussion points and action items from the client meeting.",
      "Summarize portfolio performance updates and client decisions.",
      "Document retirement planning topics and follow-up tasks.",
      "Record investment recommendations and client feedback.",
      "Outline meeting agenda outcomes and next steps for the client.",
    ],
    instructions: [
      "Summarize the meeting in clear sections: attendees, topics discussed, decisions made, and action items.",
      "Use bullet points for key takeaways and numbered lists for follow-up tasks with owners.",
      "Include a brief executive summary at the top followed by detailed notes per agenda item.",
      "Highlight any changes to the client's financial goals or risk tolerance discussed during the meeting.",
      "Format notes with headings for each topic and include relevant dates for scheduled follow-ups.",
    ],
    examples: [
      "Meeting with John Smith on 03/15/2026. Discussed portfolio rebalancing. Action: Send updated allocation proposal by Friday.",
      "Quarterly review with the Anderson family. Reviewed Q1 performance (+4.2%). Agreed to increase bond allocation by 5%.",
      "Retirement planning session. Client confirmed target retirement age of 62. Next step: Run updated Monte Carlo analysis.",
      "Investment advisory call. Client approved moving $50K to diversified ETF portfolio. Compliance review pending.",
      "Financial planning meeting. Updated estate planning priorities. Schedule follow-up with attorney by end of month.",
    ],
  },
};

export function getData(testCase: string): MeetingNotesTestCaseData {
  const data = meetingNotesTestData[testCase];
  if (!data) {
    throw new Error(`Test case data not found for: ${testCase}. Add data in data/Template/meetingNotes.data.ts`);
  }
  return data;
}
