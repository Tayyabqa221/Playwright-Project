import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { LocatorInfo } from "@interfaces/locator.info.interface";
import { PlaywrightActionFactory } from "@utilities/playwright.actions.utils";

export class AgendaPage {
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
      templateNameHeading: {
        description: "Template name heading",
        locator: page.locator("h1.ph-no-capture").first(),
      },
      templateNameInput: {
        description: "Editable template name input",
        locator: page.locator("h1#template-name, h1[data-name='name']").first(),
      },
      templateDescriptionField: {
        description: "Template description clickable field",
        locator: page.locator('p[phx-click="edit_description"], p.ph-no-capture.text-sm.text-secondary.mb-4').first(),
      },
      templateDescriptionInput: {
        description: "Editable template description input",
        locator: page.locator('p#template-description, p[data-name="description"]').first(),
      },
      agendaFocusTextarea: {
        description: "What should this agenda focus on textarea",
        locator: page.getByPlaceholder(/describe what you want this agenda to focus on/i),
      },
      firstSectionTitleField: {
        description: "First section title in agenda template editor",
        locator: page.locator("h2[data-id]").first(),
      },
      saveTemplateButton: {
        description: "Save template button",
        locator: page.locator("button.pc-button--primary[type='submit']").filter({ hasText: /save/i }).last(),
      },
      templatesBreadcrumbLink: {
        description: "Templates breadcrumb link on template editor",
        locator: page.locator('a.pc-button--clear[data-phx-link="patch"]').filter({ hasText: /^templates$/i }),
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

  async navigateToAgendaTemplates(baseUrl: string): Promise<void> {
    const url = `${baseUrl.replace(/\/$/, "")}/settings/user?tab=templates&template_type=agenda`;
    await this.playwrightActionsFactory.navigateToURL(url);
    await this.locators.newTemplateButton.locator.waitFor({ state: "visible", timeout: 15000 });
  }

  async createAgendaTemplate(): Promise<void> {
    await this.playwrightActionsFactory.click(this.locators.newTemplateButton);
    await this.page.waitForURL(/\/settings\/user\/templates\/.*category=agenda/i, { timeout: 20000 });
    await this.locators.templateNameHeading.locator.waitFor({ state: "visible", timeout: 15000 });
    await this.locators.firstSectionTitleField.locator.waitFor({ state: "visible", timeout: 15000 });
  }

  async fillTemplateName(templateName: string): Promise<void> {
    const nameHeading = this.locators.templateNameHeading.locator;
    await nameHeading.scrollIntoViewIfNeeded();
    await nameHeading.click({ force: true });

    const editableName = this.locators.templateNameInput.locator;
    await editableName.waitFor({ state: "visible", timeout: 15000 });
    await this.fillContentEditable(editableName, templateName);
    await expect(this.getTemplateNameDisplay()).toContainText(templateName, { timeout: 10000 });
  }

  async fillAgendaDescription(description: string): Promise<void> {
    const focusField = this.locators.agendaFocusTextarea.locator;
    if (await focusField.isVisible().catch(() => false)) {
      await focusField.scrollIntoViewIfNeeded();
      await focusField.click({ force: true });
      await focusField.fill(description);
      await expect(focusField).toHaveValue(description, { timeout: 10000 });
      return;
    }

    const descriptionField = this.locators.templateDescriptionField.locator;
    await descriptionField.waitFor({ state: "visible", timeout: 15000 });
    await descriptionField.scrollIntoViewIfNeeded();
    await descriptionField.click({ force: true });
    await expect(descriptionField).not.toHaveClass(/phx-click-loading/, { timeout: 15000 });

    const editableDescription = this.locators.templateDescriptionInput.locator;
    const isEditableInputVisible = await editableDescription
      .waitFor({ state: "visible", timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    const targetField = isEditableInputVisible ? editableDescription : descriptionField;

    await targetField.click({ force: true });
    await this.fillContentEditable(targetField, description);
    await expect(this.getTemplateDescriptionDisplay()).toContainText(description, { timeout: 15000 });
  }

  async fillSectionInformation(sectionInformation: string): Promise<void> {
    const section = this.locators.firstSectionTitleField.locator;
    await section.waitFor({ state: "visible", timeout: 15000 });
    await section.scrollIntoViewIfNeeded();
    await section.click({ force: true });
    await section.click({ force: true });
    await section.press("Control+A");
    await section.fill(sectionInformation);
    await this.page.keyboard.press("Tab");
    await expect(section).toContainText(sectionInformation, { timeout: 10000 });
  }

  async saveTemplate(): Promise<void> {
    const saveButton = this.locators.saveTemplateButton.locator;
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click({ force: true });
    await this.page.waitForLoadState("domcontentloaded", { timeout: 15000 });
  }

  async navigateToTemplatesList(): Promise<void> {
    const breadcrumbLink = this.locators.templatesBreadcrumbLink.locator;
    if (await breadcrumbLink.isVisible().catch(() => false)) {
      await breadcrumbLink.click({ force: true });
    } else {
      await this.page.goto(
        `${this.page.url().split("/settings/")[0]}/settings/user?tab=templates&template_type=agenda`
      );
    }
    await this.page.waitForURL(/tab=templates.*template_type=agenda/i, { timeout: 15000 });
    await this.locators.newTemplateButton.locator.waitFor({ state: "visible", timeout: 15000 });
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

  async clickTemplateAndVerifyName(templateName: string): Promise<void> {
    await this.navigateToTemplatesList();
    await this.openTemplateByName(templateName);
    await this.verifyTemplateNameOnEditor(templateName);
  }

  getCurrentTemplateId(): string {
    const match = this.page.url().match(/\/templates\/((?:btmpl|tmpl)_[^/?]+)/i);
    if (!match?.[1]) {
      throw new Error(`Template ID not found in URL: ${this.page.url()}`);
    }
    return match[1];
  }

  async editTemplateById(templateId: string): Promise<void> {
    const templateRow = this.page.locator(`tr[data-qa="template-row-${templateId}"]`);
    await this.clickEditOnRow(templateRow, templateId);
  }

  async verifyEditedAgendaTemplate(templateName: string): Promise<void> {
    await this.clickTemplateAndVerifyName(templateName);
  }

  async duplicateTemplateByName(templateName: string): Promise<void> {
    const templateRow = this.getTemplateRowByName(templateName, { exact: true });
    await this.clickDuplicateOnRow(templateRow);
  }

  async duplicateTemplateById(templateId: string): Promise<void> {
    const templateRow = this.page.locator(`tr[data-qa="template-row-${templateId}"]`);
    await this.clickDuplicateOnRow(templateRow);
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

  async deleteTemplateById(templateId: string): Promise<void> {
    const templateRow = this.page.locator(`tr[data-qa="template-row-${templateId}"]`);
    await this.clickDeleteOnRow(templateRow);
  }

  async verifyTemplateNameInList(templateName: string): Promise<void> {
    const templateRow = this.getTemplateRowByName(templateName, { exact: true });
    await templateRow.waitFor({ state: "visible", timeout: 15000 });
    await expect(templateRow.locator(".ph-no-capture").first()).toHaveText(templateName, { ignoreCase: true });
  }

  async verifyTemplateDeleted(): Promise<void> {
    await expect(this.locators.templateDeletedToast.locator).toBeVisible({ timeout: 15000 });
  }

  private async clickDuplicateOnRow(templateRow: Locator): Promise<void> {
    await templateRow.waitFor({ state: "visible", timeout: 20000 });
    await templateRow.scrollIntoViewIfNeeded();
    await templateRow.hover();

    const duplicateButton = templateRow
      .locator('a[href*="/duplicate"]')
      .or(templateRow.locator('a[phx-click="duplicate_template"]'))
      .or(templateRow.locator('a[id^="duplicate-template-"]'))
      .first();

    await duplicateButton.waitFor({ state: "visible", timeout: 15000 });
    await duplicateButton.click({ force: true });
    await this.page.waitForURL(/tab=templates.*template_type=agenda/i, { timeout: 15000 });
  }

  private async clickDeleteOnRow(templateRow: Locator): Promise<void> {
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
    await this.page.waitForURL(/tab=templates.*template_type=agenda/i, { timeout: 15000 });
  }

  private async clickEditOnRow(templateRow: Locator, templateId?: string): Promise<void> {
    await templateRow.waitFor({ state: "visible", timeout: 20000 });
    await templateRow.scrollIntoViewIfNeeded();
    await templateRow.hover();

    const editButton = templateRow
      .locator('a[phx-click="edit_template"]')
      .or(templateRow.locator('a[id^="edit-template-"]'))
      .first();

    await editButton.waitFor({ state: "visible", timeout: 15000 });
    await editButton.click({ force: true });

    if (templateId) {
      const escapedTemplateId = templateId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      await this.page.waitForURL(new RegExp(`/settings/user/templates/${escapedTemplateId}`, "i"), {
        timeout: 15000,
      });
    } else {
      await this.page.waitForURL(/\/settings\/user\/templates\//i, { timeout: 15000 });
    }

    await this.locators.templateNameHeading.locator.waitFor({ state: "visible", timeout: 15000 });
  }

  private getTemplateRowByName(templateName: string, options?: { exact?: boolean }): Locator {
    const escapedName = templateName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const namePattern = options?.exact
      ? new RegExp(`^\\s*${escapedName}\\s*$`, "i")
      : new RegExp(escapedName, "i");

    return this.page
      .locator('tr[data-qa^="template-row-"]')
      .filter({
        has: this.page.locator("td").first().locator(".ph-no-capture").filter({ hasText: namePattern }),
      })
      .first();
  }

  private async fillContentEditable(field: Locator, value: string): Promise<void> {
    await field.click({ force: true });
    await field.press("Control+A");

    const canFill = await field
      .evaluate((el) => {
        const element = el as HTMLElement;
        return (
          element.isContentEditable ||
          element.getAttribute("contenteditable") === "true" ||
          element.tagName === "INPUT" ||
          element.tagName === "TEXTAREA"
        );
      })
      .catch(() => false);

    if (canFill) {
      await field.fill(value);
    } else {
      await field.pressSequentially(value);
    }

    await this.page.keyboard.press("Tab");
  }

  private getTemplateNameDisplay() {
    return this.page.locator("h1.ph-no-capture, h1#template-name, h1[data-name='name']").first();
  }

  private getTemplateDescriptionDisplay() {
    return this.page.locator("p#template-description, p[data-name='description'], p.ph-no-capture.text-secondary").first();
  }
}
