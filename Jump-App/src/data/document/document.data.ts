import { DocumentTestCaseData } from "@interfaces/document/document.interface";
import { getEnvVariable } from "@utilities/env.utils";

const documentTestData: { [key: string]: DocumentTestCaseData } = {
  "upload-a-document": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @document @uploadDocument",
      testCase: "TC-JUMPAPP-030",
      testDescription: "Go to Document module, upload a random document, and verify uploaded file name.",
      testSummary: "Document: open module -> upload random document -> verify uploaded document name.",
    },
    uploadDocument: {
      fileExtension: ".txt",
    },
  },
  "upload-and-delete-document": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @document @uploadDocument @deleteDocument",
      testCase: "TC-JUMPAPP-031",
      testDescription: "Upload a document, open upload screen, delete document from three-dots menu, and verify toast.",
      testSummary: "Document: upload file -> open upload screen -> 3 dots -> delete -> confirm -> verify toast.",
    },
    uploadDocument: {
      fileExtension: ".txt",
    },
  },
  "upload-and-download-document": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @document @uploadDocument @downloadDocument",
      testCase: "TC-JUMPAPP-032",
      testDescription: "Upload a document, open three-dots menu, click download, and verify file downloaded.",
      testSummary: "Document: upload file -> 3 dots -> download -> verify downloaded file.",
    },
    uploadDocument: {
      fileExtension: ".txt",
    },
  },
};

export function getData(testCase: string): DocumentTestCaseData {
  const data = documentTestData[testCase];
  if (!data) {
    throw new Error(`Test case data not found for: ${testCase}. Add data in data/document/document.data.ts`);
  }
  return data;
}
