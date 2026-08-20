import { TestCaseData } from "@interfaces/testcase.data.interface";

export interface MeetingNotesTestCaseData {
  baseUrl: string;
  testCaseData: TestCaseData;
  templateNames: string[];
  descriptions: string[];
  instructions: string[];
  examples: string[];
  updatedTemplateNames?: string[];
  updatedInstructions?: string[];
  updatedExamples?: string[];
}
