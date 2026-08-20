import { TestCaseData } from "@interfaces/testcase.data.interface";

export interface AgendaTestCaseData {
  baseUrl: string;
  testCaseData: TestCaseData;
  templateNames: string[];
  descriptions: string[];
  sectionInformation: string[];
  updatedTemplateNames?: string[];
  updatedDescriptions?: string[];
}
