import fs from "fs";
import os from "os";
import path from "path";
import { faker } from "@faker-js/faker";
import { test } from "@fixtures/mergePage.fixture";
import { getDataSet } from "@utilities/env.utils";
import { getStorageStatePath } from "@utilities/storage.state.utils";
import { logTestCaseData } from "@utilities/test.helper.utils";

const uploadScenario = getDataSet("document", "documentTestData", "upload-a-document");
const uploadAndDeleteScenario = getDataSet("document", "documentTestData", "upload-and-delete-document");
const uploadAndDownloadScenario = getDataSet("document", "documentTestData", "upload-and-download-document");

test.use({ storageState: getStorageStatePath("jumpappGoogle") });

test.describe("Document", () => {
  test(
    `
      Test case: '${uploadScenario.testCaseData.testCase}'
      Summary: ${uploadScenario.testCaseData.testSummary}
      Description: ${uploadScenario.testCaseData.testDescription}
      Tags: '${uploadScenario.testCaseData.tags}'
    `,
    async ({ documentPage }) => {
      await logTestCaseData(test.info(), uploadScenario.testCaseData);

      const randomFileName = `jumpapp-${faker.string.alphanumeric(10).toLowerCase()}${uploadScenario.uploadDocument.fileExtension}`;
      const randomFilePath = path.join(os.tmpdir(), randomFileName);
      fs.writeFileSync(randomFilePath, `Auto generated file for ${uploadScenario.testCaseData.testCase}`);

      try {
        await test.step("Go to document", async () => {
          await documentPage.navigateToDocument(uploadScenario.baseUrl);
        });

        await test.step("Click on Upload and add random document", async () => {
          await documentPage.uploadDocument(randomFilePath);
        });

        await test.step("Verify the document name", async () => {
          await documentPage.verifyUploadedDocumentName(randomFileName);
        });
      } finally {
        if (fs.existsSync(randomFilePath)) {
          fs.unlinkSync(randomFilePath);
        }
      }
    }
  );

  test(
    `
      Test case: '${uploadAndDeleteScenario.testCaseData.testCase}'
      Summary: ${uploadAndDeleteScenario.testCaseData.testSummary}
      Description: ${uploadAndDeleteScenario.testCaseData.testDescription}
      Tags: '${uploadAndDeleteScenario.testCaseData.tags}'
    `,
    async ({ documentPage }) => {
      await logTestCaseData(test.info(), uploadAndDeleteScenario.testCaseData);

      const randomFileName = `jumpapp-${faker.string.alphanumeric(10).toLowerCase()}${uploadAndDeleteScenario.uploadDocument.fileExtension}`;
      const randomFilePath = path.join(os.tmpdir(), randomFileName);
      fs.writeFileSync(randomFilePath, `Auto generated file for ${uploadAndDeleteScenario.testCaseData.testCase}`);

      try {
        await test.step("Upload a document", async () => {
          await documentPage.navigateToDocument(uploadAndDeleteScenario.baseUrl);
          await documentPage.uploadDocument(randomFilePath);
          await documentPage.verifyUploadedDocumentName(randomFileName);
        });

        await test.step("Then go to Documents tab", async () => {
          await documentPage.goToDocumentTab();
        });

        await test.step("Click on three dots then click delete and confirm", async () => {
          await documentPage.deleteFirstDocumentUsingThreeDots(randomFileName);
        });

        await test.step("Verify the toast message", async () => {
          await documentPage.verifyDocumentDeletedToast(randomFileName);
        });

      } finally {
        if (fs.existsSync(randomFilePath)) {
          fs.unlinkSync(randomFilePath);
        }
      }
    }
  );

  test(
    `
      Test case: '${uploadAndDownloadScenario.testCaseData.testCase}'
      Summary: ${uploadAndDownloadScenario.testCaseData.testSummary}
      Description: ${uploadAndDownloadScenario.testCaseData.testDescription}
      Tags: '${uploadAndDownloadScenario.testCaseData.tags}'
    `,
    async ({ documentPage }) => {
      await logTestCaseData(test.info(), uploadAndDownloadScenario.testCaseData);

      const randomFileName = `jumpapp-${faker.string.alphanumeric(10).toLowerCase()}${uploadAndDownloadScenario.uploadDocument.fileExtension}`;
      const randomFilePath = path.join(os.tmpdir(), randomFileName);
      const downloadedFilePath = path.join(os.tmpdir(), `downloaded-${randomFileName}`);
      fs.writeFileSync(randomFilePath, `Auto generated file for ${uploadAndDownloadScenario.testCaseData.testCase}`);

      try {
        await test.step("Upload a document and verify file appears", async () => {
          await documentPage.navigateToDocument(uploadAndDownloadScenario.baseUrl);
          await documentPage.uploadDocument(randomFilePath);
          await documentPage.verifyUploadedDocumentName(randomFileName);
        });

        await test.step("Click on three dots and download document", async () => {
          const download = await documentPage.downloadFirstDocumentUsingThreeDots(randomFileName);
          await download.saveAs(downloadedFilePath);
        });

        await test.step("Verify document is downloaded", async () => {
          if (!fs.existsSync(downloadedFilePath)) {
            throw new Error(`Downloaded file not found at path: ${downloadedFilePath}`);
          }
        });
      } finally {
        if (fs.existsSync(randomFilePath)) {
          fs.unlinkSync(randomFilePath);
        }
        if (fs.existsSync(downloadedFilePath)) {
          fs.unlinkSync(downloadedFilePath);
        }
      }
    }
  );
});
