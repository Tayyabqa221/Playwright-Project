import { faker } from "@faker-js/faker";
import { test } from "@fixtures/mergePage.fixture";
import { AgendaTestCaseData } from "@interfaces/Template/agenda.interface";
import { getDataSet } from "@utilities/env.utils";
import { getStorageStatePath } from "@utilities/storage.state.utils";
import { logTestCaseData } from "@utilities/test.helper.utils";

const createScenario = getDataSet("agenda", "agendaTestData", "create-agenda-template") as AgendaTestCaseData;
const duplicateScenario = getDataSet("agenda", "agendaTestData", "duplicate-agenda-template") as AgendaTestCaseData;
const deleteScenario = getDataSet("agenda", "agendaTestData", "delete-agenda-template") as AgendaTestCaseData;
const editScenario = getDataSet("agenda", "agendaTestData", "edit-agenda-template") as AgendaTestCaseData;

const buildUniqueTemplateName = (names: string[]): string =>
  `${faker.helpers.arrayElement(names)} ${faker.lorem.words(2)}`;

const buildUniqueDescription = (descriptions: string[]): string =>
  `${faker.helpers.arrayElement(descriptions)} ${faker.lorem.sentence()}`;

test.use({ storageState: getStorageStatePath("jumpappGoogle") });

test.describe("Agenda Template", () => {
  test(
    `
      Test case: '${createScenario.testCaseData.testCase}'
      Summary: ${createScenario.testCaseData.testSummary}
      Description: ${createScenario.testCaseData.testDescription}
      Tags: '${createScenario.testCaseData.tags}'
    `,
    async ({ agendaPage }) => {
      await logTestCaseData(test.info(), createScenario.testCaseData);

      const templateName = buildUniqueTemplateName(createScenario.templateNames);
      const templateDescription = buildUniqueDescription(createScenario.descriptions);

      await test.step("Create template with name and description", async () => {
        await agendaPage.navigateToAgendaTemplates(createScenario.baseUrl);
        await agendaPage.createAgendaTemplate();
        await agendaPage.fillTemplateName(templateName);
        await agendaPage.fillAgendaDescription(templateDescription);
      });

      await test.step("Click on save", async () => {
        await agendaPage.saveTemplate();
      });

      await test.step("Click on template and verify name", async () => {
        await agendaPage.clickTemplateAndVerifyName(templateName);
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
    async ({ agendaPage }) => {
      await logTestCaseData(test.info(), duplicateScenario.testCaseData);

      const templateName = buildUniqueTemplateName(duplicateScenario.templateNames);
      const templateDescription = buildUniqueDescription(duplicateScenario.descriptions);
      let templateId = "";

      await test.step("Create an agenda template", async () => {
        await agendaPage.navigateToAgendaTemplates(duplicateScenario.baseUrl);
        await agendaPage.createAgendaTemplate();
        await agendaPage.fillTemplateName(templateName);
        await agendaPage.fillAgendaDescription(templateDescription);
        await agendaPage.saveTemplate();
        templateId = agendaPage.getCurrentTemplateId();
      });

      await test.step("Open agenda templates list", async () => {
        await agendaPage.navigateToTemplatesList();
      });

      await test.step("Click duplicate icon of created template", async () => {
        await agendaPage.duplicateTemplateById(templateId);
      });

      await test.step("Verify the duplicated template", async () => {
        await agendaPage.verifyDuplicatedTemplate(templateName);
      });
    }
  );

  test.only(
    `
      Test case: '${deleteScenario.testCaseData.testCase}'
      Summary: ${deleteScenario.testCaseData.testSummary}
      Description: ${deleteScenario.testCaseData.testDescription}
      Tags: '${deleteScenario.testCaseData.tags}'
    `,
    async ({ agendaPage }) => {
      await logTestCaseData(test.info(), deleteScenario.testCaseData);

      const templateName = buildUniqueTemplateName(deleteScenario.templateNames);
      const templateDescription = buildUniqueDescription(deleteScenario.descriptions);
      let templateId = "";

      await test.step("Create an agenda template", async () => {
        await agendaPage.navigateToAgendaTemplates(deleteScenario.baseUrl);
        await agendaPage.createAgendaTemplate();
        await agendaPage.fillTemplateName(templateName);
        await agendaPage.fillAgendaDescription(templateDescription);
        await agendaPage.saveTemplate();
        templateId = agendaPage.getCurrentTemplateId();
      });

      await test.step("Open agenda templates list and verify name", async () => {
        await agendaPage.navigateToTemplatesList();
        await agendaPage.verifyTemplateNameInList(templateName);
      });

      await test.step("Click delete icon of created template", async () => {
        await agendaPage.deleteTemplateById(templateId);
      });

      await test.step("Verify template deleted toast message", async () => {
        await agendaPage.verifyTemplateDeleted();
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
    async ({ agendaPage }) => {
      await logTestCaseData(test.info(), editScenario.testCaseData);

      const dataIndex = faker.number.int({ min: 0, max: editScenario.templateNames.length - 1 });
      const templateName = buildUniqueTemplateName([editScenario.templateNames[dataIndex]]);
      const templateDescription = buildUniqueDescription([editScenario.descriptions[dataIndex]]);
      const updatedTemplateName = buildUniqueTemplateName([editScenario.updatedTemplateNames![dataIndex]]);
      const updatedDescription = buildUniqueDescription([editScenario.updatedDescriptions![dataIndex]]);
      let templateId = "";

      await test.step("Create an agenda template", async () => {
        await agendaPage.navigateToAgendaTemplates(editScenario.baseUrl);
        await agendaPage.createAgendaTemplate();
        await agendaPage.fillTemplateName(templateName);
        await agendaPage.fillAgendaDescription(templateDescription);
        await agendaPage.saveTemplate();
        templateId = agendaPage.getCurrentTemplateId();
      });

      await test.step("Go to agenda templates and click edit icon", async () => {
        await agendaPage.navigateToTemplatesList();
        await agendaPage.editTemplateById(templateId);
      });

      await test.step("Edit name and description and save", async () => {
        await agendaPage.fillTemplateName(updatedTemplateName);
        await agendaPage.fillAgendaDescription(updatedDescription);
        await agendaPage.saveTemplate();
      });

      await test.step("Verify the edited template", async () => {
        await agendaPage.verifyEditedAgendaTemplate(updatedTemplateName);
      });
    }
  );
});
