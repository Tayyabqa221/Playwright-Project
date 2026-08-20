import { faker } from "@faker-js/faker";
import { test } from "@fixtures/mergePage.fixture";
import { MeetingPrepTestCaseData } from "@interfaces/Template/meetingPrep.interface";
import { getDataSet } from "@utilities/env.utils";
import { getStorageStatePath } from "@utilities/storage.state.utils";
import { logTestCaseData } from "@utilities/test.helper.utils";

const createScenario = getDataSet("meetingPrep", "meetingPrepTestData", "create-meeting-prep-template") as MeetingPrepTestCaseData;
const duplicateScenario = getDataSet("meetingPrep", "meetingPrepTestData", "duplicate-meeting-prep-template") as MeetingPrepTestCaseData;
const editScenario = getDataSet("meetingPrep", "meetingPrepTestData", "edit-meeting-prep-template") as MeetingPrepTestCaseData;
const deleteScenario = getDataSet("meetingPrep", "meetingPrepTestData", "delete-meeting-prep-template") as MeetingPrepTestCaseData;

test.use({ storageState: getStorageStatePath("jumpappGoogle") });

test.describe("Meeting Prep Template", () => {
  test(
    `
      Test case: '${createScenario.testCaseData.testCase}'
      Summary: ${createScenario.testCaseData.testSummary}
      Description: ${createScenario.testCaseData.testDescription}
      Tags: '${createScenario.testCaseData.tags}'
    `,
    async ({ meetingPrepPage }) => {
      await logTestCaseData(test.info(), createScenario.testCaseData);

      const templateName = `${faker.helpers.arrayElement(createScenario.templateNames)} ${faker.string.alphanumeric(4)}`;
      const templateDescription = faker.helpers.arrayElement(createScenario.descriptions);

      await test.step("Go to User settings > Templates", async () => {
        await meetingPrepPage.navigateToUserSettingsTemplates(createScenario.baseUrl);
      });

      await test.step("Create a meeting prep template", async () => {
        await meetingPrepPage.createMeetingPrepTemplate();
      });

      await test.step("Add random template name and description", async () => {
        await meetingPrepPage.renameTemplateName(templateName);
        await meetingPrepPage.fillFirstSectionInformation(templateDescription);
      });

      await test.step("Scroll down and save", async () => {
        await meetingPrepPage.scrollAndSaveTemplate();
      });

      await test.step("Go to template and verify name", async () => {
        await meetingPrepPage.clickTemplateAndVerifyName(templateName);
      });
    }
  );

  test(
    `
      Test case: '${duplicateScenario.testCaseData.testCase}'
      Summary: ${duplicateScenario.testCaseData.testSummary}
      Description: ${duplicateScenario.testCaseData.testDescription}
      Tags: '${duplicateScenario.testCaseData.tags}'
    `,
    async ({ meetingPrepPage }) => {
      await logTestCaseData(test.info(), duplicateScenario.testCaseData);

      const templateName = `${faker.helpers.arrayElement(duplicateScenario.templateNames)} ${faker.string.alphanumeric(4)}`;
      const templateDescription = faker.helpers.arrayElement(duplicateScenario.descriptions);

      await test.step("Go to User settings > Templates", async () => {
        await meetingPrepPage.navigateToUserSettingsTemplates(duplicateScenario.baseUrl);
      });

      await test.step("Create a template", async () => {
        await meetingPrepPage.createMeetingPrepTemplate();
        await meetingPrepPage.renameTemplateName(templateName);
        await meetingPrepPage.fillFirstSectionInformation(templateDescription);
        await meetingPrepPage.scrollAndSaveTemplate();
      });

      await test.step("Open templates list", async () => {
        await meetingPrepPage.navigateToUserSettingsTemplates(duplicateScenario.baseUrl);
      });

      await test.step("Click duplicate icon of created template", async () => {
        await meetingPrepPage.duplicateTemplateByName(templateName);
      });

      await test.step("Verify the duplicated template", async () => {
        await meetingPrepPage.verifyDuplicatedTemplate(templateName);
      });
    }
  );

  test(
    `
      Test case: '${editScenario.testCaseData.testCase}'
      Summary: ${editScenario.testCaseData.testSummary}
      Description: ${editScenario.testCaseData.testDescription}
      Tags: '${editScenario.testCaseData.tags}'
    `,
    async ({ meetingPrepPage }) => {
      await logTestCaseData(test.info(), editScenario.testCaseData);

      const nameIndex = faker.number.int({ min: 0, max: editScenario.templateNames.length - 1 });
      const templateName = `${editScenario.templateNames[nameIndex]} ${faker.string.alphanumeric(4)}`;
      const templateDescription = editScenario.descriptions[nameIndex];
      const updatedTemplateName = `${editScenario.updatedTemplateNames![nameIndex]} ${faker.string.alphanumeric(4)}`;
      const updatedTemplateDescription = editScenario.updatedDescriptions![nameIndex];

      await test.step("Go to User settings > Templates", async () => {
        await meetingPrepPage.navigateToUserSettingsTemplates(editScenario.baseUrl);
      });

      await test.step("Create a new template", async () => {
        await meetingPrepPage.createMeetingPrepTemplate();
        await meetingPrepPage.renameTemplateName(templateName);
        await meetingPrepPage.fillFirstSectionInformation(templateDescription);
        await meetingPrepPage.scrollAndSaveTemplate();
      });

      await test.step("Open templates list", async () => {
        await meetingPrepPage.navigateToUserSettingsTemplates(editScenario.baseUrl);
      });

      await test.step("Click edit icon of created template", async () => {
        await meetingPrepPage.editTemplateByName(templateName);
      });

      await test.step("Update template name and description and save", async () => {
        await meetingPrepPage.renameTemplateName(updatedTemplateName);
        await meetingPrepPage.fillFirstSectionInformation(updatedTemplateDescription);
        await meetingPrepPage.scrollAndSaveTemplate();
      });

      await test.step("Go to updated template and verify name", async () => {
        await meetingPrepPage.navigateToUserSettingsTemplates(editScenario.baseUrl);
        await meetingPrepPage.openTemplateByName(updatedTemplateName);
        await meetingPrepPage.verifyTemplateNameOnEditor(updatedTemplateName);
      });
    }
  );

  test(
    `
      Test case: '${deleteScenario.testCaseData.testCase}'
      Summary: ${deleteScenario.testCaseData.testSummary}
      Description: ${deleteScenario.testCaseData.testDescription}
      Tags: '${deleteScenario.testCaseData.tags}'
    `,
    async ({ meetingPrepPage }) => {
      await logTestCaseData(test.info(), deleteScenario.testCaseData);

      const templateName = `${faker.helpers.arrayElement(deleteScenario.templateNames)} ${faker.string.alphanumeric(4)}`;
      const templateDescription = faker.helpers.arrayElement(deleteScenario.descriptions);

      await test.step("Go to User settings > Templates", async () => {
        await meetingPrepPage.navigateToUserSettingsTemplates(deleteScenario.baseUrl);
      });

      await test.step("Create a new template", async () => {
        await meetingPrepPage.createMeetingPrepTemplate();
        await meetingPrepPage.renameTemplateName(templateName);
        await meetingPrepPage.fillFirstSectionInformation(templateDescription);
        await meetingPrepPage.scrollAndSaveTemplate();
      });

      await test.step("Open templates list", async () => {
        await meetingPrepPage.navigateToUserSettingsTemplates(deleteScenario.baseUrl);
      });

      await test.step("Click delete button of created template", async () => {
        await meetingPrepPage.deleteTemplateByName(templateName);
      });

      await test.step("Verify template deleted toast message", async () => {
        await meetingPrepPage.verifyTemplateDeleted();
      });
    }
  );
});
