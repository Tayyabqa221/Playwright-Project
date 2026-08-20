import { TestCaseData } from "@interfaces/testcase.data.interface";

export interface MeetingPrepTestCaseData {
  baseUrl: string;
  testCaseData: TestCaseData;
  templateNames: string[];
  descriptions: string[];
  updatedTemplateNames?: string[];
  updatedDescriptions?: string[];
}
