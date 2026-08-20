import { TestCaseData } from "@interfaces/testcase.data.interface";

export interface DocumentTestCaseData {
  baseUrl: string;
  testCaseData: TestCaseData;
  uploadDocument: {
    fileExtension: string;
  };
}
