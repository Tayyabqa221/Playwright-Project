import { faker } from "@faker-js/faker";
import { test } from "@fixtures/mergePage.fixture";
import { MeetingNotesTestCaseData } from "@interfaces/Template/meetingNotes.interface";
import { getDataSet } from "@utilities/env.utils";
import { getStorageStatePath } from "@utilities/storage.state.utils";
import { logTestCaseData } from "@utilities/test.helper.utils";

const createScenario = getDataSet(
  "meetingNotes",
  "meetingNotesTestData",
  "create-meeting-notes-template"
) as MeetingNotesTestCaseData;
const duplicateScenario = getDataSet(
  "meetingNotes",
  "meetingNotesTestData",
  "duplicate-meeting-notes-template"
) as MeetingNotesTestCaseData;
const editScenario = getDataSet(
  "meetingNotes",
  "meetingNotesTestData",
  "edit-meeting-notes-template"
) as MeetingNotesTestCaseData;
const deleteScenario = getDataSet(
  "meetingNotes",
  "meetingNotesTestData",
  "delete-meeting-notes-template"
) as MeetingNotesTestCaseData;

test.use({ storageState: getStorageStatePath("jumpappGoogle") });

test.describe("Meeting Notes Template", () => {
  test(
    `
      Test case: '${createScenario.testCaseData.testCase}'
      Summary: ${createScenario.testCaseData.testSummary}
      Description: ${createScenario.testCaseData.testDescription}
      Tags: '${createScenario.testCaseData.tags}'
    `,
    async ({ meetingNotesPage }) => {
      await logTestCaseData(test.info(), createScenario.testCaseData);

      const templateName = faker.helpers.arrayElement(createScenario.templateNames);
      const templateInstructions = `${faker.helpers.arrayElement(createScenario.instructions)} ${faker.lorem.sentence()}`;
      const templateExample = `${faker.helpers.arrayElement(createScenario.examples)} ${faker.lorem.sentence()}`;

      await test.step("Go to Templates > Meeting Notes", async () => {
        await meetingNotesPage.navigateToMeetingNotesTemplates(createScenario.baseUrl);
      });

      await test.step("Create a meeting notes template", async () => {
        await meetingNotesPage.createMeetingNotesTemplate();
      });

      await test.step("Add random template name", async () => {
        await meetingNotesPage.fillTemplateName(templateName);
      });

      await test.step("Add random instructions and example", async () => {
        await meetingNotesPage.fillTemplateInstructions(templateInstructions);
        await meetingNotesPage.fillTemplateExample(templateExample);
      });

      await test.step("Click on save", async () => {
        await meetingNotesPage.saveTemplate();
      });

      await test.step("Click on template and verify name", async () => {
        await meetingNotesPage.clickTemplateAndVerifyName(templateName);
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
    async ({ meetingNotesPage }) => {
      await logTestCaseData(test.info(), duplicateScenario.testCaseData);

      const templateName = faker.helpers.arrayElement(duplicateScenario.templateNames);
      const templateInstructions = `${faker.helpers.arrayElement(duplicateScenario.instructions)} ${faker.lorem.sentence()}`;
      const templateExample = `${faker.helpers.arrayElement(duplicateScenario.examples)} ${faker.lorem.sentence()}`;

      await test.step("Go to Templates > Meeting Notes", async () => {
        await meetingNotesPage.navigateToMeetingNotesTemplates(duplicateScenario.baseUrl);
      });

      await test.step("Create a meeting notes template", async () => {
        await meetingNotesPage.createMeetingNotesTemplate();
        await meetingNotesPage.fillTemplateName(templateName);
        await meetingNotesPage.fillTemplateInstructions(templateInstructions);
        await meetingNotesPage.fillTemplateExample(templateExample);
        await meetingNotesPage.saveTemplate();
      });

      await test.step("Open meeting notes templates list", async () => {
        await meetingNotesPage.navigateToMeetingNotesTemplates(duplicateScenario.baseUrl);
      });

      await test.step("Click duplicate icon of created template", async () => {
        await meetingNotesPage.duplicateTemplateByName(templateName);
      });

      await test.step("Verify the duplicated template", async () => {
        await meetingNotesPage.verifyDuplicatedTemplate(templateName);
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
    async ({ meetingNotesPage }) => {
      await logTestCaseData(test.info(), editScenario.testCaseData);

      const dataIndex = faker.number.int({ min: 0, max: editScenario.templateNames.length - 1 });
      const templateName = editScenario.templateNames[dataIndex];
      const templateInstructions = editScenario.instructions[dataIndex];
      const templateExample = editScenario.examples[dataIndex];
      const updatedTemplateName = editScenario.updatedTemplateNames![dataIndex];
      const updatedInstructions = editScenario.updatedInstructions![dataIndex];
      const updatedExample = editScenario.updatedExamples![dataIndex];
      let templateId = "";

      await test.step("Go to Templates > Meeting Notes", async () => {
        await meetingNotesPage.navigateToMeetingNotesTemplates(editScenario.baseUrl);
      });

      await test.step("Create a meeting notes template", async () => {
        await meetingNotesPage.createMeetingNotesTemplate();
        await meetingNotesPage.fillTemplateName(templateName);
        await meetingNotesPage.fillTemplateInstructions(templateInstructions);
        await meetingNotesPage.fillTemplateExample(templateExample);
        await meetingNotesPage.saveTemplate();
        templateId = meetingNotesPage.getCurrentTemplateId();
      });

      await test.step("Open meeting notes templates list", async () => {
        await meetingNotesPage.navigateToTemplatesList();
      });

      await test.step("Click edit icon of created template", async () => {
        await meetingNotesPage.editTemplateById(templateId);
      });

      await test.step("Edit all information and save", async () => {
        await meetingNotesPage.fillTemplateName(updatedTemplateName);
        await meetingNotesPage.fillTemplateInstructions(updatedInstructions);
        await meetingNotesPage.fillTemplateExample(updatedExample);
        await meetingNotesPage.saveTemplate();
      });

      await test.step("Go to meeting notes and verify name", async () => {
        await meetingNotesPage.clickTemplateAndVerifyName(updatedTemplateName);
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
    async ({ meetingNotesPage }) => {
      await logTestCaseData(test.info(), deleteScenario.testCaseData);

      const templateName = faker.helpers.arrayElement(deleteScenario.templateNames);
      const templateInstructions = faker.helpers.arrayElement(deleteScenario.instructions);
      const templateExample = faker.helpers.arrayElement(deleteScenario.examples);
      let templateId = "";

      await test.step("Go to Templates > Meeting Notes", async () => {
        await meetingNotesPage.navigateToMeetingNotesTemplates(deleteScenario.baseUrl);
      });

      await test.step("Create a meeting notes template", async () => {
        await meetingNotesPage.createMeetingNotesTemplate();
        await meetingNotesPage.fillTemplateName(templateName);
        await meetingNotesPage.fillTemplateInstructions(templateInstructions);
        await meetingNotesPage.fillTemplateExample(templateExample);
        await meetingNotesPage.saveTemplate();
        templateId = meetingNotesPage.getCurrentTemplateId();
      });

      await test.step("Open meeting notes templates list", async () => {
        await meetingNotesPage.navigateToTemplatesList();
      });

      await test.step("Click delete icon of created template", async () => {
        await meetingNotesPage.deleteTemplateById(templateId);
      });

      await test.step("Verify template deleted toast message", async () => {
        await meetingNotesPage.verifyTemplateDeleted();
      });
    }
  );
});
