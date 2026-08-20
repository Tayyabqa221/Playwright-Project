import { TestCaseData } from "@interfaces/testcase.data.interface";

export interface ContactsTestCaseData {
  baseUrl: string;
  testCaseData: TestCaseData;
  createContact: {
    emailDomain: string;
  };
  uploadDocument?: {
    filePath: string;
    expectedFileName: string;
    expectedDownloadedFileName?: string;
  };
}
