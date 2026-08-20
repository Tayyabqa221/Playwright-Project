import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { LocatorInfo } from "@interfaces/locator.info.interface";
import { PlaywrightActionFactory } from "@utilities/playwright.actions.utils";

export class MeetingPrepPage {
  private readonly page: Page;
  private readonly playwrightActionsFactory: PlaywrightActionFactory;
  private readonly locators: { [key: string]: LocatorInfo };

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.playwrightActionsFactory = new PlaywrightActionFactory(page, testInfo);
    this.locators = {
      newTemplateButton: {
        description: "New template button",
        locator: page.getByRole("button", { name: /new template/i }),
      },
      templatesSettingsTab: {
        description: "Templates tab in user settings",
        locator: page.getByRole("link", { name: /^templates$/i }),
      },
      templateNameHeading: {
        description: "Template name heading",
        locator: page.locator("h1[phx-click='edit_name'], h1.ph-no-capture").first(),
      },
      templateNameInput: {
        description: "Editable template name input",
        locator: page.locator("h1#template-name, h1[data-name='name']").first(),
      },
      firstSectionTitleField: {
        description: "First section title",
        locator: page.locator("h2[data-id]").first(),
      },
      saveTemplateButton: {
        description: "Save template button",
        locator: page.locator("button.pc-button--primary[type='submit']").filter({ hasText: /save/i }).last(),
      },
      duplicateTemplateButton: {
        description: "Duplicate template icon link",
        locator: page.locator('a[phx-click="duplicate_template"], a[id^="duplicate-template-"]'),
      },
      templateDuplicatedToast: {
        description: "Template duplicated success toast",
        locator: page
          .locator(".toast.toast-success, #toasts, [role='alert'], [role='status']")
          .filter({ hasText: /template duplicated successfully/i })
          .or(page.getByText(/template duplicated successfully/i))
          .first(),
      },
      deleteTemplateConfirmButton: {
        description: "Yes, delete button in delete confirmation modal",
        locator: page
          .getByRole("button", { name: /yes,\s*delete/i })
          .or(page.locator("button.test-class-delete[type='submit']"))
          .or(page.locator("button.pc-button--danger[type='submit']").filter({ hasText: /yes,\s*delete/i })),
      },
      templateDeletedToast: {
        description: "Template deleted success toast",
        locator: page
          .locator(".toast.toast-success, #toasts, [role='alert'], [role='status']")
          .filter({ hasText: /template deleted successfully/i })
          .or(page.getByText(/template deleted successfully/i))
          .first(),
      },
    };
  }

  async navigateToUserSettingsTemplates(baseUrl: string): Promise<void> {
    const url = `${baseUrl.replace(/\/$/, "")}/settings/user?tab=templates`;
    await this.playwrightActionsFactory.navigateToURL(url);
    await this.locators.newTemplateButton.locator.waitFor({ state: "visible", timeout: 15000 });
  }

  async createMeetingPrepTemplate(): Promise<void> {
    await this.playwrightActionsFactory.click(this.locators.newTemplateButton);
    await this.page.waitForURL(/\/settings\/user\/templates\/.*category=meeting_prep/i, { timeout: 20000 });
    await this.locators.templateNameHeading.locator.waitFor({ state: "visible", timeout: 15000 });
  }

  async renameTemplateName(templateName: string): Promise<void> {
    await this.locators.templateNameHeading.locator.click({ force: true });
    const editableName = this.locators.templateNameInput.locator;
    await editableName.waitFor({ state: "visible", timeout: 10000 });
    await this.fillContentEditable(editableName, templateName);
    await expect(this.getTemplateNameDisplay()).toContainText(templateName, { timeout: 10000 });
  }

  async fillFirstSectionInformation(sectionInformation: string): Promise<void> {
    const section = this.locators.firstSectionTitleField.locator;
    await section.scrollIntoViewIfNeeded();
    await section.click({ force: true });
    await section.click({ force: true });
    await section.fill(sectionInformation);
    await this.page.keyboard.press("Tab");
  }

  async scrollAndSaveTemplate(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const saveButton = this.locators.saveTemplateButton.locator;
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click({ force: true });
    await this.page.waitForLoadState("domcontentloaded", { timeout: 15000 });
  }

  async clickTemplateAndVerifyName(templateName: string): Promise<void> {
    const namePattern = new RegExp(templateName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const sidebarTemplate = this.page.locator("aside, nav").getByText(namePattern).first();
    if (await sidebarTemplate.isVisible().catch(() => false)) {
      await sidebarTemplate.click({ force: true });
    } else {
      await this.locators.templatesSettingsTab.locator.click({ force: true });
      const listTemplate = this.page.getByText(namePattern).first();
      await listTemplate.waitFor({ state: "visible", timeout: 20000 });
      await listTemplate.click({ force: true });
    }

    await this.page.waitForURL(/\/settings\/user\/templates\//i, { timeout: 15000 });
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await expect(this.getTemplateNameDisplay()).toContainText(namePattern, { timeout: 15000 });
  }

  async duplicateTemplateByName(templateName: string): Promise<void> {
    const templateRow = this.getTemplateRowByName(templateName, { exact: true });
    await templateRow.waitFor({ state: "visible", timeout: 20000 });
    await templateRow.scrollIntoViewIfNeeded();
    await templateRow.hover();

    const duplicateButton = templateRow
      .locator('a[phx-click="duplicate_template"]')
      .or(templateRow.locator('a[id^="duplicate-template-"]'))
      .first();

    await duplicateButton.waitFor({ state: "visible", timeout: 15000 });
    await duplicateButton.click({ force: true });
  }

  async verifyDuplicatedTemplate(templateName: string): Promise<void> {
    await expect(this.locators.templateDuplicatedToast.locator).toBeVisible({ timeout: 15000 });

    const duplicatedTemplateName = `${templateName} (1)`;
    const duplicatedTemplateRow = this.getTemplateRowByName(duplicatedTemplateName, { exact: true });

    await duplicatedTemplateRow.waitFor({ state: "visible", timeout: 15000 });
    await expect(duplicatedTemplateRow.locator(".ph-no-capture").first()).toHaveText(duplicatedTemplateName, {
      ignoreCase: true,
    });
  }

  async editTemplateByName(templateName: string): Promise<void> {
    const templateRow = this.getTemplateRowByName(templateName, { exact: true });
    await templateRow.waitFor({ state: "visible", timeout: 20000 });
    await templateRow.scrollIntoViewIfNeeded();
    await templateRow.hover();

    const editButton = templateRow
      .locator('a[phx-click="edit_template"]')
      .or(templateRow.locator('a[id^="edit-template-"]'))
      .first();

    await editButton.waitFor({ state: "visible", timeout: 15000 });
    await editButton.click({ force: true });
    await this.page.waitForURL(/\/settings\/user\/templates\//i, { timeout: 15000 });
    await this.locators.templateNameHeading.locator.waitFor({ state: "visible", timeout: 15000 });
  }

  async verifyTemplateNameInList(templateName: string): Promise<void> {
    const templateRow = this.getTemplateRowByName(templateName, { exact: true });
    await templateRow.waitFor({ state: "visible", timeout: 15000 });
    await expect(templateRow.locator(".ph-no-capture").first()).toHaveText(templateName, { ignoreCase: true });
  }

  async openTemplateByName(templateName: string): Promise<void> {
    const templateRow = this.getTemplateRowByName(templateName, { exact: true });
    await templateRow.waitFor({ state: "visible", timeout: 20000 });
    await templateRow.scrollIntoViewIfNeeded();
    await templateRow.locator(".ph-no-capture").first().click({ force: true });
    await this.page.waitForURL(/\/settings\/user\/templates\//i, { timeout: 15000 });
    await this.locators.templateNameHeading.locator.waitFor({ state: "visible", timeout: 15000 });
  }

  async verifyTemplateNameOnEditor(templateName: string): Promise<void> {
    const namePattern = new RegExp(templateName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await expect(this.getTemplateNameDisplay()).toContainText(namePattern, { timeout: 15000 });
  }

  async deleteTemplateByName(templateName: string): Promise<void> {
    const templateRow = this.getTemplateRowByName(templateName, { exact: true });
    await templateRow.waitFor({ state: "visible", timeout: 20000 });
    await templateRow.scrollIntoViewIfNeeded();
    await templateRow.hover();

    const deleteButton = templateRow
      .locator('a[phx-click="delete_template"]')
      .or(templateRow.locator('a[id^="delete-template-"]'))
      .or(templateRow.getByRole("button", { name: /delete template/i }))
      .first();

    await deleteButton.waitFor({ state: "visible", timeout: 15000 });
    await deleteButton.click({ force: true });
    await this.locators.deleteTemplateConfirmButton.locator.waitFor({ state: "visible", timeout: 15000 });
    await this.locators.deleteTemplateConfirmButton.locator.click({ force: true });
  }

  async verifyTemplateDeleted(): Promise<void> {
    await expect(this.locators.templateDeletedToast.locator).toBeVisible({ timeout: 15000 });
  }

  private getTemplateRowByName(templateName: string, options?: { exact?: boolean }): Locator {
    const escapedName = templateName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const namePattern = options?.exact
      ? new RegExp(`^\\s*${escapedName}\\s*$`, "i")
      : new RegExp(escapedName, "i");

    return this.page
      .locator('tr[data-qa^="template-row-"]')
      .filter({ has: this.page.locator(".ph-no-capture").filter({ hasText: namePattern }) })
      .first();
  }

  private async fillContentEditable(field: Locator, value: string): Promise<void> {
    await field.click({ force: true });
    await field.fill(value);
    await this.page.keyboard.press("Tab");
  }

  private getTemplateNameDisplay() {
    return this.page.locator("h1.ph-no-capture, h1#template-name, h1[data-name='name']").first();
  }
}
