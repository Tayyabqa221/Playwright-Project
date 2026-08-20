import { Download, expect, Locator, Page, TestInfo } from "@playwright/test";
import path from "path";
import { LocatorInfo } from "@interfaces/locator.info.interface";
import { PlaywrightActionFactory } from "@utilities/playwright.actions.utils";
import { PlaywrightVerificationFactory } from "@utilities/playwright.verifications.utils";

export class DocumentPage {
  private readonly page: Page;
  private readonly playwrightActionsFactory: PlaywrightActionFactory;
  private readonly playwrightVerificationFactory: PlaywrightVerificationFactory;
  private readonly locators: { [key: string]: LocatorInfo };

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.playwrightActionsFactory = new PlaywrightActionFactory(page, testInfo);
    this.playwrightVerificationFactory = new PlaywrightVerificationFactory(page, testInfo);
    this.locators = {
      uploadButton: {
        description: "Upload button in document module",
        locator: page
          .getByRole("button", { name: /upload/i })
          .first()
          .or(page.locator("[data-testid*='upload'], [data-test*='upload']").first()),
      },
      fileInput: {
        description: "Document file upload input",
        locator: page
          .locator("input[type='file']")
          .first(),
      },
      documentsSidebarLink: {
        description: "Documents link in sidebar",
        locator: page
          .getByRole("link", { name: /documents?/i })
          .first()
          .or(page.getByRole("button", { name: /documents?/i }).first())
          .or(page.getByLabel(/documents?/i).first()),
      },
      documentsTabTrigger: {
        description: "Documents tab trigger on document module",
        locator: page
          .getByRole("tab", { name: /documents?/i })
          .first()
          .or(page.getByRole("button", { name: /documents?/i }).first())
          .or(page.getByRole("link", { name: /documents?/i }).first()),
      },
      documentThreeDotsButton: {
        description: "Document row three dots menu button",
        locator: page.locator("xpath=(//button[contains(@id,'dropdown') and contains(@id,'trigger')])[1]"),
      },
      firstDocumentRow: {
        description: "First document row/item",
        locator: page
          .locator("tbody tr, [role='row'], li, article, [data-testid*='document'], [data-test*='document']")
          .first(),
      },
      deleteMenuItem: {
        description: "Delete menu item",
        locator: page
          .locator("button[aria-label*='Delete document' i], button[phx-click='delete_document']")
          .first()
          .or(page.getByRole("menuitem", { name: /delete/i }).first())
          .or(page.getByRole("button", { name: /delete/i }).first())
          .or(page.locator("[role='menuitem'], button, a").filter({ hasText: /delete/i }).first()),
      },
      downloadMenuItem: {
        description: "Download menu item",
        locator: page
          .locator("button[aria-label*='Download document' i], a[download], button[phx-click*='download' i]")
          .first()
          .or(page.getByRole("menuitem", { name: /download/i }).first())
          .or(page.getByRole("button", { name: /download/i }).first())
          .or(page.locator("[role='menuitem'], button, a").filter({ hasText: /download/i }).first()),
      },
      confirmDeleteButton: {
        description: "Confirm delete button",
        locator: page
          .locator("button.test-class-delete, button[data-ref='confirm']")
          .first()
          .or(
            page
              .getByRole("button", { name: /yes|yes,?\s*delete|confirm|delete/i })
              .first()
          )
          .or(page.locator("button").filter({ hasText: /yes|yes,?\s*delete|confirm|delete/i }).first()),
      },
      confirmDeleteInput: {
        description: "Confirm delete input",
        locator: page.locator("input#confirm_input, input[name='confirm_input']").first(),
      },
      documentDeletedToast: {
        description: "Document deleted success toast",
        locator: page
          .locator("#toasts, #success, [role='status'], [role='alert'], [data-testid*='toast'], [class*='toast']")
          .filter({ hasText: /document.*deleted|deleted.*document|removed|success|moved to trash|trashed/i })
          .or(page.getByText(/document.*deleted|deleted.*document|removed|moved to trash|trashed|successfully deleted/i).first())
          .first(),
      },
    };
  }

  /** Opens document module via route candidates and sidebar fallback. */
  async navigateToDocument(baseUrl: string): Promise<void> {
    const rootUrl = baseUrl.replace(/\/$/, "");
    const candidateUrls = [`${rootUrl}/documents`, `${rootUrl}/document`];

    for (const candidateUrl of candidateUrls) {
      await this.playwrightActionsFactory.navigateToURL(candidateUrl);
      await this.page.waitForLoadState("domcontentloaded", { timeout: 20000 });
      if (this.isDocumentRoute(this.page.url())) {
        return;
      }
      if (await this.isDocumentModuleReady(5000)) {
        return;
      }
    }

    await this.playwrightActionsFactory.navigateToURL(rootUrl);
    await this.page.waitForLoadState("domcontentloaded", { timeout: 20000 });

    if (await this.locators.documentsSidebarLink.locator.isVisible().catch(() => false)) {
      await this.playwrightActionsFactory.click(this.locators.documentsSidebarLink);
      await this.page.waitForLoadState("domcontentloaded", { timeout: 10000 });
      if (this.isDocumentRoute(this.page.url()) || (await this.isDocumentModuleReady(10000))) {
        return;
      }
    }

    throw new Error(`Unable to open Document module. Current URL: ${this.page.url()}`);
  }

  /** Clicks upload and sets file into file input. */
  async uploadDocument(filePathOrName: string): Promise<string> {
    const uploadTrigger = this.page
      .getByRole("button", { name: /upload( document)?|add document|new document/i })
      .or(this.page.getByRole("link", { name: /upload( document)?|add document|new document/i }))
      .or(this.page.getByText(/^upload$/i))
      .or(this.page.locator("[data-testid*='upload'], [data-test*='upload']"))
      .first();
    if (await uploadTrigger.isVisible().catch(() => false)) {
      await uploadTrigger.click({ force: true });
    } else if (await this.locators.uploadButton.locator.isVisible().catch(() => false)) {
      await this.playwrightActionsFactory.click(this.locators.uploadButton);
    }

    const absoluteFilePath = path.isAbsolute(filePathOrName) ? filePathOrName : path.resolve(process.cwd(), filePathOrName);
    const fileInput = this.page
      .locator("input[type='file']")
      .or(this.page.locator("input[accept*='pdf'], input[accept*='doc'], input[accept*='txt']"))
      .first();
    await fileInput.waitFor({ state: "attached", timeout: 20000 });
    await this.playwrightActionsFactory.setInputFiles(
      { description: "Document file upload input", locator: fileInput },
      absoluteFilePath
    );
    await this.playwrightActionsFactory.waitForSec(1);
    return path.basename(absoluteFilePath);
  }

  /** Verifies uploaded document name is visible in list. */
  async verifyUploadedDocumentName(expectedFileName: string): Promise<void> {
    const escapedName = expectedFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const uploadedDocumentName: Locator = this.page.getByText(new RegExp(`\\b${escapedName}\\b`, "i")).first();
    await this.playwrightVerificationFactory.expectElementExist({
      description: `Uploaded document name ${expectedFileName}`,
      locator: uploadedDocumentName,
    });
    await expect(uploadedDocumentName).toBeVisible({ timeout: 15000 });
  }

  /** Opens uploaded documents screen where row actions are available. */
  async goToUploadScreen(): Promise<void> {
    await this.goToDocumentTab();

    const initialActionButton = await this.getFirstDocumentActionButton();
    if (initialActionButton && (await initialActionButton.isVisible().catch(() => false))) {
      return;
    }

    const currentUrl = this.page.url();
    const rootUrl = currentUrl.match(/^https?:\/\/[^/]+/i)?.[0] ?? "";
    const listCandidates = rootUrl
      ? [`${rootUrl}/documents`, `${rootUrl}/document`, `${rootUrl}/documents?tab=uploaded`]
      : [];

    for (const candidateUrl of listCandidates) {
      await this.playwrightActionsFactory.navigateToURL(candidateUrl);
      await this.page.waitForLoadState("domcontentloaded", { timeout: 10000 });
      const actionButton = await this.getFirstDocumentActionButton();
      if (actionButton && (await actionButton.isVisible().catch(() => false))) {
        return;
      }
    }

    await this.page.waitForLoadState("domcontentloaded", { timeout: 10000 });
  }

  /** Ensures user is in the document tab within document module. */
  async goToDocumentTab(): Promise<void> {
    if (!this.isDocumentRoute(this.page.url()) && !(await this.isDocumentModuleReady(5000))) {
      const rootUrl = this.page.url().match(/^https?:\/\/[^/]+/i)?.[0];
      if (rootUrl) {
        await this.navigateToDocument(rootUrl);
      }
    }

    const tabTrigger = this.locators.documentsTabTrigger.locator.first();
    if (await tabTrigger.isVisible().catch(() => false)) {
      await tabTrigger.click({ force: true });
      await this.playwrightActionsFactory.waitForSec(0.5);
    }
  }

  /** Deletes the target document from three-dots menu and confirms. */
  async deleteFirstDocumentUsingThreeDots(expectedFileName?: string): Promise<void> {
    await this.goToUploadScreen();
    const targetRow = expectedFileName
      ? this.getDocumentRowByFileName(expectedFileName)
      : this.locators.firstDocumentRow.locator.first();

    const targetRowVisible = await targetRow.isVisible().catch(() => false);
    if (expectedFileName && !targetRowVisible) {
      throw new Error(`Uploaded document row not found for delete action: ${expectedFileName}`);
    }
    if (targetRowVisible) {
      await targetRow.scrollIntoViewIfNeeded().catch(() => {});
      await targetRow.hover().catch(() => {});
      await this.playwrightActionsFactory.waitForSec(0.5);
    }

    let rowActionButton = targetRowVisible ? await this.getActionButtonForRow(targetRow) : null;
    if (expectedFileName && !rowActionButton) {
      throw new Error(`Three-dots button not found in uploaded document row: ${expectedFileName}`);
    }
    if (!rowActionButton) {
      rowActionButton = await this.getFirstDocumentActionButton();
    }
    if (!rowActionButton) {
      throw new Error("Document row action (three-dots) button was not found in uploaded list.");
    }
    if (!(await rowActionButton.isVisible().catch(() => false))) {
      await this.page.mouse.move(300, 300);
      await this.playwrightActionsFactory.waitForSec(1);
      rowActionButton = await this.getFirstDocumentActionButton();
      if (!rowActionButton) {
        throw new Error("Document row action (three-dots) button is unavailable after hover.");
      }
    }
    await rowActionButton.click({ force: true });
    const deleteMenuItem = this.locators.deleteMenuItem.locator.first();
    await deleteMenuItem.waitFor({ state: "visible", timeout: 10000 });
    await deleteMenuItem.click({ force: true });

    const dangerDialog = this.page.locator("#danger_dialog");
    const dialogVisible = await dangerDialog
      .waitFor({ state: "visible", timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    const dialogConfirmButton = dangerDialog
      .locator("button[data-ref='confirm'], button[value='confirm'], button.test-class-delete")
      .first();

    if (dialogVisible) {
      await dialogConfirmButton.waitFor({ state: "visible", timeout: 8000 });
      await dialogConfirmButton.click({ force: true });
      return;
    }

    // Some variants perform delete immediately from the menu without opening a modal.
    const fallbackConfirmButton = this.page
      .locator("[role='dialog']:visible, dialog:visible, #danger_dialog:visible")
      .last()
      .locator("button[data-ref='confirm'], button[value='confirm'], button.test-class-delete")
      .first();
    const fallbackConfirmVisible = await fallbackConfirmButton
      .waitFor({ state: "visible", timeout: 2500 })
      .then(() => true)
      .catch(() => false);
    if (fallbackConfirmVisible) {
      await fallbackConfirmButton.click({ force: true });
    }
  }

  /** Downloads the target document from three-dots menu and returns Playwright download object. */
  async downloadFirstDocumentUsingThreeDots(expectedFileName?: string): Promise<Download> {
    await this.goToUploadScreen();
    const targetRow = expectedFileName
      ? this.getDocumentRowByFileName(expectedFileName)
      : this.locators.firstDocumentRow.locator.first();

    const targetRowVisible = await targetRow.isVisible().catch(() => false);
    if (expectedFileName && !targetRowVisible) {
      throw new Error(`Uploaded document row not found for download action: ${expectedFileName}`);
    }
    if (targetRowVisible) {
      await targetRow.scrollIntoViewIfNeeded().catch(() => {});
      await targetRow.hover().catch(() => {});
      await this.playwrightActionsFactory.waitForSec(0.5);
    }

    let rowActionButton = targetRowVisible ? await this.getActionButtonForRow(targetRow) : null;
    if (expectedFileName && !rowActionButton) {
      throw new Error(`Three-dots button not found in uploaded document row: ${expectedFileName}`);
    }
    if (!rowActionButton) {
      rowActionButton = await this.getFirstDocumentActionButton();
    }
    if (!rowActionButton) {
      throw new Error("Document row action (three-dots) button was not found in uploaded list.");
    }
    await rowActionButton.click({ force: true });

    const downloadMenuItem = this.locators.downloadMenuItem.locator.first();
    await downloadMenuItem.waitFor({ state: "visible", timeout: 10000 });
    const [download] = await Promise.all([this.page.waitForEvent("download", { timeout: 20000 }), downloadMenuItem.click({ force: true })]);
    return download;
  }

  private getDocumentRowByFileName(fileName: string): Locator {
    const escapedName = fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return this.page
      .locator("tbody tr, [role='row'], li, article, [data-testid*='document'], [data-test*='document']")
      .filter({ hasText: new RegExp(`\\b${escapedName}\\b`, "i") })
      .first();
  }

  private async getActionButtonForRow(row: Locator): Promise<Locator | null> {
    const rowScopedCandidates: Locator[] = [
      row.locator("button[id*='dropdown'][id*='trigger']").first(),
      row.locator("button[aria-haspopup='menu']").first(),
      row.locator("button[aria-label*='more' i], button[aria-label*='options' i], button[aria-label*='menu' i]").first(),
      row.locator("button:has(svg[data-qa='ellipsis_vertical'])").first(),
      row.getByRole("button", { name: /more|options|menu|actions?|three/i }).first(),
    ];

    for (const candidate of rowScopedCandidates) {
      const count = await candidate.count().catch(() => 0);
      if (count > 0) {
        return candidate;
      }
    }

    return null;
  }

  /** Finds first row action/three-dots trigger with resilient selectors. */
  private async getFirstDocumentActionButton(): Promise<Locator | null> {
    const firstRow = this.locators.firstDocumentRow.locator.first();
    const rowScopedCandidates: Locator[] = [
      firstRow.getByRole("button", { name: /more|options|menu|actions?|three/i }).first(),
      firstRow.locator("button[aria-haspopup='menu']").first(),
      firstRow.locator("button[id*='dropdown'][id*='trigger']").first(),
      firstRow.locator("button:has(svg)").first(),
    ];

    for (const candidate of rowScopedCandidates) {
      const count = await candidate.count().catch(() => 0);
      if (count > 0) {
        return candidate;
      }
    }

    const pageLevelCandidates: Locator[] = [
      this.page.locator("button[id*='dropdown'][id*='trigger']").first(),
      this.page.locator("button[aria-haspopup='menu']").first(),
      this.page.getByRole("button", { name: /more|options|menu|actions?|three/i }).first(),
    ];

    for (const candidate of pageLevelCandidates) {
      const count = await candidate.count().catch(() => 0);
      if (count > 0) {
        return candidate;
      }
    }

    return null;
  }

  /** Verifies success toast after document deletion. */
  async verifyDocumentDeletedToast(expectedFileName?: string): Promise<void> {
    const escapedName = expectedFileName ? expectedFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
    const expectedNameRegex = escapedName ? new RegExp(`\\b${escapedName}\\b`, "i") : null;
    const successRegex = /document.*deleted|deleted.*document|removed|success|moved to trash|trashed/i;

    await expect
      .poll(
        async () => {
          const toastVisible = await this.locators.documentDeletedToast.locator.isVisible().catch(() => false);
          if (toastVisible) {
            const toastText = (await this.locators.documentDeletedToast.locator.textContent().catch(() => "")) ?? "";
            if (!expectedNameRegex || expectedNameRegex.test(toastText) || successRegex.test(toastText)) {
              return true;
            }
          }

          const successFlashText = (await this.page.locator("#success").textContent().catch(() => "")) ?? "";
          if (successRegex.test(successFlashText) && (!expectedNameRegex || expectedNameRegex.test(successFlashText))) {
            return true;
          }

          const alertText = (await this.page.locator("[role='alert'], [role='status']").first().textContent().catch(() => "")) ?? "";
          if (successRegex.test(alertText) && (!expectedNameRegex || expectedNameRegex.test(alertText))) {
            return true;
          }

          const toastsFlash = (await this.page.locator("#toasts").getAttribute("data-flash").catch(() => "")) ?? "";
          if (toastsFlash !== "" && toastsFlash !== "[]") {
            return !expectedNameRegex || expectedNameRegex.test(toastsFlash) || successRegex.test(toastsFlash);
          }

          if (expectedFileName) {
            const deletedRow = this.getDocumentRowByFileName(expectedFileName);
            const stillVisible = await deletedRow.isVisible().catch(() => false);
            if (!stillVisible) {
              return true;
            }
          }

          return false;
        },
        { timeout: 20000 }
      )
      .toBeTruthy();
  }

  private async isDocumentModuleReady(timeoutMs: number): Promise<boolean> {
    try {
      await Promise.race([
        this.locators.uploadButton.locator.waitFor({ state: "visible", timeout: timeoutMs }),
        this.locators.fileInput.locator.waitFor({ state: "attached", timeout: timeoutMs }),
      ]);
      return true;
    } catch {
      return false;
    }
  }

  private isDocumentRoute(url: string): boolean {
    return /\/documents?(\/|$|\?)/i.test(url);
  }
}
