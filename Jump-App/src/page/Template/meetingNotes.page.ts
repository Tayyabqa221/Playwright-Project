import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { LocatorInfo } from "@interfaces/locator.info.interface";
import { PlaywrightActionFactory } from "@utilities/playwright.actions.utils";

export class MeetingNotesPage {
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
      meetingNotesSidebarLink: {
        description: "Meeting Notes template type in sidebar",
        locator: page.getByText(/^meeting notes$/i),
      },
      templateNameHeading: {
        description: "Template name heading",
        locator: page.locator("h1.ph-no-capture").first(),
      },
      templateNameInput: {
        description: "Editable template name input",
        locator: page.locator("h1#template-title, h1[data-name='name']").first(),
      },
      templateDescriptionField: {
        description: "Template description field",
        locator: page.locator("p#template-description, p[data-name='description']").first(),
      },
      templateInstructionsEditor: {
        description: "Template instructions textarea",
        locator: page.locator("textarea#template-instructions-editor"),
      },
      templateExampleEditor: {
        description: "Template example textarea",
        locator: page.locator("textarea#template-example-editor"),
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

  async navigateToMeetingNotesTemplates(baseUrl: string): Promise<void> {
    const url = `${baseUrl.replace(/\/$/, "")}/settings/user?tab=templates&template_type=meeting_notes`;
    await this.playwrightActionsFactory.navigateToURL(url);
    await this.locators.newTemplateButton.locator.waitFor({ state: "visible", timeout: 15000 });
  }

  async createMeetingNotesTemplate(): Promise<void> {
    await this.playwrightActionsFactory.click(this.locators.newTemplateButton);
    await this.page.waitForURL(/\/settings\/user\/templates\/.*category=meeting_notes/i, { timeout: 20000 });
    await this.locators.templateNameHeading.locator.waitFor({ state: "visible", timeout: 15000 });
    await this.locators.templateInstructionsEditor.locator.waitFor({ state: "visible", timeout: 15000 });
  }

  async fillTemplateName(templateName: string): Promise<void> {
    const nameHeading = this.locators.templateNameHeading.locator;
    await nameHeading.scrollIntoViewIfNeeded();
    await nameHeading.click({ force: true });

    const editableName = this.locators.templateNameInput.locator;
    await editableName.waitFor({ state: "visible", timeout: 10000 });
    await this.fillContentEditable(editableName, templateName);
    await expect(this.getTemplateNameDisplay()).toContainText(templateName, { timeout: 10000 });
  }

  async fillTemplateDescription(description: string): Promise<void> {
    const descriptionField = this.locators.templateDescriptionField.locator;
    const isVisible = await descriptionField.isVisible().catch(() => false);
    if (!isVisible) {
      return;
    }
    await descriptionField.scrollIntoViewIfNeeded();
    await descriptionField.click({ force: true });
    await this.fillContentEditable(descriptionField, description);
  }

  async fillTemplateInstructions(instructions: string): Promise<void> {
    const instructionsEditor = this.locators.templateInstructionsEditor.locator;
    await instructionsEditor.scrollIntoViewIfNeeded();
    await instructionsEditor.click({ force: true });
    await instructionsEditor.press("Control+A");
    await instructionsEditor.fill(instructions);
  }

  async fillTemplateExample(example: string): Promise<void> {
    const exampleEditor = this.locators.templateExampleEditor.locator;
    await exampleEditor.scrollIntoViewIfNeeded();
    await exampleEditor.click({ force: true });
    await exampleEditor.press("Control+A");
    await exampleEditor.fill(example);
  }

  async saveTemplate(): Promise<void> {
    const saveButton = this.locators.saveTemplateButton.locator;
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click({ force: true });
    await this.page.waitForLoadState("domcontentloaded", { timeout: 15000 });
  }

  async clickTemplateAndVerifyName(templateName: string): Promise<void> {
    await this.navigateToTemplatesList();
    await this.openTemplateByName(templateName);
    await this.verifyTemplateNameOnEditor(templateName);
  }

  async navigateToTemplatesList(): Promise<void> {
    const breadcrumbLink = this.locators.templatesBreadcrumbLink.locator;
    if (await breadcrumbLink.isVisible().catch(() => false)) {
      await breadcrumbLink.click({ force: true });
    } else {
      await this.page.goto(
        `${this.page.url().split("/settings/")[0]}/settings/user?tab=templates&template_type=meeting_notes`
      );
    }
    await this.page.waitForURL(/tab=templates.*template_type=meeting_notes/i, { timeout: 15000 });
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
    await expect(templateRow.locator("td").first().locator(".ph-no-capture")).toHaveText(templateName, {
      ignoreCase: true,
    });
    await this.clickEditOnRow(templateRow);
  }

  getCurrentTemplateId(): string {
    const match = this.page.url().match(/\/templates\/(tmpl_[^/?]+)/i);
    if (!match?.[1]) {
      throw new Error(`Template ID not found in URL: ${this.page.url()}`);
    }
    return match[1];
  }

  async editTemplateById(templateId: string): Promise<void> {
    const templateRow = this.page.locator(`tr[data-qa="template-row-${templateId}"]`);
    await this.clickEditOnRow(templateRow, templateId);
  }

  async deleteTemplateByName(templateName: string): Promise<void> {
    const templateRow = this.getTemplateRowByName(templateName, { exact: true });
    await expect(templateRow.locator("td").first().locator(".ph-no-capture")).toHaveText(templateName, {
      ignoreCase: true,
    });
    await this.clickDeleteOnRow(templateRow);
  }

  async deleteTemplateById(templateId: string): Promise<void> {
    const templateRow = this.page.locator(`tr[data-qa="template-row-${templateId}"]`);
    await this.clickDeleteOnRow(templateRow);
  }

  async verifyTemplateDeleted(): Promise<void> {
    await expect(this.locators.templateDeletedToast.locator).toBeVisible({ timeout: 15000 });
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
    await this.locators.templateInstructionsEditor.locator.waitFor({ state: "visible", timeout: 15000 });
  }

  async verifyTemplateInstructions(instructions: string): Promise<void> {
    await expect(this.locators.templateInstructionsEditor.locator).toHaveValue(instructions, { timeout: 15000 });
  }

  async verifyTemplateExample(example: string): Promise<void> {
    await expect(this.locators.templateExampleEditor.locator).toHaveValue(example, { timeout: 15000 });
  }

  async verifyEditedMeetingNotes(
    templateName: string,
    instructions: string,
    example: string
  ): Promise<void> {
    await this.verifyTemplateNameOnEditor(templateName);
    await this.verifyTemplateInstructions(instructions);
    await this.verifyTemplateExample(example);
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
    await field.fill(value);
    await this.page.keyboard.press("Tab");
  }

  private getTemplateNameDisplay() {
    return this.page.locator("h1.ph-no-capture, h1#template-title, h1[data-name='name']").first();
  }
}
