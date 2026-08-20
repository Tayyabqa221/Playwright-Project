import { expect, Locator, Page, TestInfo } from "@playwright/test";
import path from "path";
import { LocatorInfo } from "@interfaces/locator.info.interface";
import { PlaywrightActionFactory } from "@utilities/playwright.actions.utils";
import { PlaywrightVerificationFactory } from "@utilities/playwright.verifications.utils";

export class ContactsPage {
  private readonly page: Page;
  private readonly playwrightActionsFactory: PlaywrightActionFactory;
  private readonly playwrightVerificationFactory: PlaywrightVerificationFactory;
  private readonly locators: { [key: string]: LocatorInfo };
  /** Row/list item opened from search; used to scope overflow actions away from unrelated UI. */
  private activeContactResultRow: Locator | null = null;
  /** Detail drawer/dialog after opening a contact from results (overflow menu often lives here, not in the row). */
  private activeContactPanel: Locator | null = null;

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.playwrightActionsFactory = new PlaywrightActionFactory(page, testInfo);
    this.playwrightVerificationFactory = new PlaywrightVerificationFactory(page, testInfo);
    this.locators = {
      createContactButton: {
        description: "Create contact button",
        locator: page
          .locator('button:has-text("Create contact"), a:has-text("Create contact")')
          .first()
          .or(page.locator('[data-testid*="create-contact"], [data-test*="create-contact"]').first())
          .or(page.locator("button").filter({ hasText: /create contact|new contact|add contact/i }).first()),
      },
      firstNameInput: {
        description: "First name input",
        locator: page
          .getByRole("textbox", { name: /first name/i })
          .or(page.getByLabel(/first name/i))
          .or(page.locator('input[name="firstName"], input[name="first_name"], input[placeholder*="First"]').first()),
      },
      lastNameInput: {
        description: "Last name input",
        locator: page
          .getByRole("textbox", { name: /last name/i })
          .or(page.getByLabel(/last name/i))
          .or(page.locator('input[name="lastName"], input[name="last_name"], input[placeholder*="Last"]').first()),
      },
      fullNameInput: {
        description: "Full name input",
        locator: page
          .getByRole("textbox", { name: /^name$/i })
          .or(page.getByLabel(/^name$/i))
          .or(page.locator('input[name="name"], input[placeholder*="Name"]').first()),
      },
      emailInput: {
        description: "Email input",
        locator: page
          .getByRole("textbox", { name: /^email$/i })
          .or(page.getByLabel(/^email$/i))
          .or(page.locator('input[type="email"], input[name="email"], input[placeholder*="Email"]').first()),
      },
      saveContactButton: {
        description: "Save contact button",
        locator: page
          .getByLabel(/create an individual contact/i)
          .getByRole("button", { name: /create contact|save contact|save/i })
          .first()
          .or(
            page
              .locator('form[aria-label*="individual contact"], [aria-label*="individual contact"]')
              .locator('button[type="submit"]')
              .first()
          )
          .or(page.locator('[data-testid*="save-contact"], [data-test*="save-contact"]').first()),
      },
      saveEditedContactButton: {
        description: "Save edited contact button",
        locator: page
          .getByRole("button", { name: /save changes|save contact|save|update/i })
          .first()
          .or(page.locator('button[type="submit"]').filter({ hasText: /save|update/i }).first())
          .or(page.locator('[data-testid*="save"], [data-test*="save"]').first()),
      },
      searchInput: {
        description: "Contacts search input",
        locator: page
          .locator('input[placeholder*="Find contacts"], input[placeholder*="Search"], input[name="query"], input[name="search"], input[type="search"]')
          .first(),
      },
      filterByMeetingNameButton: {
        description: "Filter by meeting name button",
        locator: page
          .getByRole("button", { name: /filter by meeting name|sort by name/i })
          .first()
          .or(page.getByText(/Sort by Name/i).first()),
      },
      editContactButton: {
        description: "Edit contact button",
        locator: page
          .getByRole("button", { name: /edit contact|edit/i })
          .first()
          .or(page.locator('[data-testid*="edit-contact"], [data-test*="edit-contact"]').first()),
      },
      openOptionsButton: {
        description: "Open options button",
        locator: page.getByRole("button", { name: /open options/i }).first(),
      },
      editContactMenuItem: {
        description: "Edit contact menu item",
        locator: page
          .getByRole("menuitem", { name: /edit contact|edit/i })
          .first()
          .or(page.locator('[role="menuitem"], a, button').filter({ hasText: /edit contact|edit/i }).first()),
      },
      deleteContactMenuItem: {
        description: "Delete contact menu item",
        locator: page
          .getByRole("menuitem", { name: /delete contact|delete|remove/i })
          .first()
          .or(page.locator('[role="menuitem"], a, button').filter({ hasText: /delete contact|delete|remove/i }).first()),
      },
      confirmDeleteContactButton: {
        description: "Confirm delete contact button",
        locator: page
          .getByRole("button", { name: /yes,?\s*delete|delete contact|delete|remove/i })
          .first()
          .or(page.locator("button.pc-button--danger, button.test-class-delete").filter({ hasText: /delete|remove/i }).first()),
      },
      contactDeletedToast: {
        description: "Contact deleted success toast",
        locator: page
          .locator('[role="status"], [role="alert"], [data-testid*="toast"], [class*="toast"]')
          .filter({ hasText: /contact.*deleted|deleted.*contact|contact removed|removed successfully|success/i })
          .first(),
      },
      contactThreeDotIcon: {
        description: "Contact three dot (ellipsis vertical) menu button",
        locator: page.locator("//button[.//*[name()='svg' and @data-qa='ellipsis_vertical']]").first(),
      },
      appHomeShell: {
        description: "App home shell ready",
        locator: page.locator("#new-meeting-menu-trigger"),
      },
      contactsSidebarLink: {
        description: "Contacts link in sidebar",
        locator: page
          .getByLabel("Contacts")
          .first()
          .or(page.getByRole("link", { name: "Contacts", exact: true }).first())
          .or(page.getByRole("button", { name: "Contacts", exact: true }).first()),
      },
    };
  }

  async navigateToContacts(baseUrl: string): Promise<void> {
    this.activeContactResultRow = null;
    this.activeContactPanel = null;
    const rootUrl = baseUrl.replace(/\/$/, "");

    const candidateUrls = [`${rootUrl}/contacts`, `${rootUrl}/contact`];
    for (const candidateUrl of candidateUrls) {
      await this.playwrightActionsFactory.navigateToURL(candidateUrl);
      await this.page.waitForLoadState("domcontentloaded", { timeout: 20000 });
      if (await this.isContactsPageReady(5000)) {
        return;
      }
    }

    await this.playwrightActionsFactory.navigateToURL(rootUrl);
    await this.page.waitForLoadState("domcontentloaded", { timeout: 20000 });
    if (await this.locators.contactsSidebarLink.locator.isVisible()) {
      await this.playwrightActionsFactory.click(this.locators.contactsSidebarLink);
      await this.page.waitForLoadState("domcontentloaded", { timeout: 10000 });
      if (await this.isContactsPageReady(5000)) {
        return;
      }
    }

    const currentUrl = this.page.url();
    throw new Error(
      `Unable to open Contacts module. Current URL: ${currentUrl}. Auth state may be missing/expired or Contacts route is inaccessible.`
    );
  }

  async createContact(firstName: string, lastName: string, email: string): Promise<string> {
    const fullName = `${firstName} ${lastName}`;
    await this.openCreateContactFormIfNeeded();
    await this.fillContactForm(firstName, lastName, email);
    await this.playwrightActionsFactory.click(this.locators.saveContactButton);

    // Wait until modal/form closes and created contact appears in list.
    const createdContact = this.page.getByText(new RegExp(`^\\s*${fullName}\\s*$`, "i")).first();
    await createdContact.waitFor({ state: "visible", timeout: 20000 });
    return fullName;
  }

  async searchContact(contactName: string): Promise<void> {
    const search = this.locators.searchInput.locator;
    await search.click();
    await search.fill("");
    await this.playwrightActionsFactory.sendKeys(this.locators.searchInput, contactName);
    await search.press("Enter");
    await this.page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    await this.playwrightActionsFactory.waitForSec(1);
  }

  async clickFilterByMeetingName(): Promise<void> {
    await this.locators.filterByMeetingNameButton.locator.first().click();
    await this.playwrightActionsFactory.waitForSec(0.5);
  }

  async sortContactsByName(order: "a-z" | "z-a"): Promise<void> {
    const exactPattern = order === "a-z" ? /^a\s*-\s*z$/i : /^z\s*-\s*a$/i;
    const altPattern =
      order === "a-z"
        ? /a\s*(?:-|to)\s*z|ascending|name\s*\(a-z\)|alphabetical/i
        : /z\s*(?:-|to)\s*a|descending|name\s*\(z-a\)|reverse alphabetical/i;
    await this.clickFilterByMeetingName();

    const sortOption = this.page
      .getByRole("menuitem", { name: exactPattern })
      .or(this.page.getByRole("option", { name: exactPattern }))
      .or(this.page.getByRole("button", { name: exactPattern }))
      .or(this.page.getByRole("link", { name: exactPattern }))
      .or(this.page.getByRole("menuitem", { name: altPattern }))
      .or(this.page.getByRole("option", { name: altPattern }))
      .or(this.page.getByRole("button", { name: altPattern }))
      .or(this.page.getByRole("link", { name: altPattern }))
      .or(this.page.locator("[role='menuitem'], [role='option'], button, a").filter({ hasText: exactPattern }).first())
      .or(this.page.locator("[role='menuitem'], [role='option'], button, a").filter({ hasText: altPattern }).first())
      .first();

    if (await sortOption.isVisible().catch(() => false)) {
      await sortOption.click({ force: true });
      await this.playwrightActionsFactory.waitForSec(1);
      return;
    }

    // Fallback for UIs where the same sort button toggles between ascending/descending.
    await this.locators.filterByMeetingNameButton.locator.first().click();
    await this.playwrightActionsFactory.waitForSec(1);
  }

  async clickContactsModuleAgain(): Promise<void> {
    await this.locators.contactsSidebarLink.locator.first().click();
    await this.page.waitForLoadState("domcontentloaded", { timeout: 10000 });
    await this.waitForContactsPageReady();
  }

  async openContactFromSearchResults(searchValue: string): Promise<void> {
    const escaped = searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const emailRegex = new RegExp(`\\b${escaped}\\b`, "i");

    const main = this.page.locator('[role="main"], main').first();
    const scope = (await main.count()) > 0 ? main : this.page;

    const tableRow = scope.locator("tbody tr").filter({ hasText: emailRegex }).first();
    const ariaRow = scope.getByRole("row").filter({ hasText: emailRegex }).first();
    const listRow = scope.locator('[data-testid*="contact"], [data-test*="contact"]').filter({ hasText: emailRegex }).first();

    const candidates = [tableRow, ariaRow, listRow];
    let rowToOpen: Locator | null = null;
    for (const candidate of candidates) {
      try {
        await candidate.waitFor({ state: "visible", timeout: 8000 });
        rowToOpen = candidate;
        break;
      } catch {
        // try next strategy
      }
    }

    if (!rowToOpen) {
      rowToOpen = scope
        .locator("tr, [role='row'], li, article, section")
        .filter({ hasText: emailRegex })
        .filter({ hasNot: this.locators.searchInput.locator })
        .first();
      await rowToOpen.waitFor({ state: "visible", timeout: 15000 });
    }

    this.activeContactResultRow = rowToOpen;
    await this.openRowByNameOrPrimaryAction(rowToOpen, emailRegex);

    await this.playwrightActionsFactory.waitForSec(1);

    const panelCandidates = [
      this.page.getByRole("dialog").filter({ hasText: emailRegex }),
      this.page.locator("aside").filter({ hasText: emailRegex }),
      this.page.locator('[data-testid*="drawer"], [data-testid*="panel"]').filter({ hasText: emailRegex }),
    ];
    this.activeContactPanel = null;
    for (const candidate of panelCandidates) {
      const first = candidate.first();
      try {
        await first.waitFor({ state: "visible", timeout: 5000 });
        this.activeContactPanel = first;
        break;
      } catch {
        // try next
      }
    }
    const hasDetailControls = async (): Promise<boolean> => {
      const scope = this.activeContactPanel ?? this.page.locator("main").first();
      const hasPastMeetings = await scope
        .getByRole("button", { name: /past meetings?/i })
        .or(scope.getByRole("tab", { name: /past meetings?/i }))
        .or(scope.getByRole("link", { name: /past meetings?/i }))
        .first()
        .isVisible()
        .catch(() => false);
      const hasMeetingPrep = await scope
        .getByRole("tab", { name: /meeting prep|pre-meeting prep|pre meeting prep/i })
        .or(scope.getByRole("button", { name: /meeting prep|pre-meeting prep|pre meeting prep/i }))
        .or(scope.getByRole("link", { name: /meeting prep|pre-meeting prep|pre meeting prep/i }))
        .first()
        .isVisible()
        .catch(() => false);
      return hasPastMeetings || hasMeetingPrep;
    };

    if (!this.activeContactPanel && !(await hasDetailControls())) {
      await rowToOpen.click({ clickCount: 2, timeout: 3000 }).catch(() => {});
      await this.playwrightActionsFactory.waitForSec(0.8);
      await rowToOpen.press("Enter").catch(() => {});
      await this.playwrightActionsFactory.waitForSec(0.8);
    }

    if (!this.activeContactPanel) {
      const fullPageCandidates = [
        this.page.locator("main").first(),
        this.page.locator('[role="main"]').first(),
        this.page.locator("body").first(),
      ];
      for (const candidate of fullPageCandidates) {
        const hasPastMeetingTabs = await candidate
          .getByRole("tab", { name: /Upcoming|All past|AI-Processed|AI processed|Needs Action/i })
          .first()
          .isVisible()
          .catch(() => false);
        const hasMeetingPrep = await candidate
          .getByRole("tab", { name: /meeting prep|pre-meeting prep|pre meeting prep/i })
          .or(candidate.getByRole("button", { name: /meeting prep|pre-meeting prep|pre meeting prep/i }))
          .first()
          .isVisible()
          .catch(() => false);
        if (hasPastMeetingTabs || hasMeetingPrep) {
          this.activeContactPanel = candidate;
          break;
        }
      }
    }
  }

  async editOpenedContact(updatedFirstName: string, updatedLastName: string, updatedEmail: string): Promise<void> {
    if (!(await this.hasContactFormVisible())) {
      if (await this.locators.editContactButton.locator.isVisible()) {
        await this.locators.editContactButton.locator.click();
        await this.playwrightActionsFactory.waitForSec(0.5);
      }
    }
    if (!(await this.hasContactFormVisible())) {
      const menuScope = this.activeContactPanel ?? this.activeContactResultRow ?? this.page;
      const ellipsisVerticalButton = menuScope
        .locator("xpath=.//button[.//*[name()='svg' and @data-qa='ellipsis_vertical']]")
        .or(this.page.locator("//button[.//*[name()='svg' and @data-qa='ellipsis_vertical']]"))
        .first();
      const openOptions = menuScope.getByRole("button", { name: /open options/i }).first();
      const legacyThreeDot = menuScope
        .locator("//div[contains(@class,'icon-button')]//*[name()='svg']")
        .or(menuScope.getByRole("button", { name: /more|options|menu|actions|open menu/i }))
        .first();
      try {
        await ellipsisVerticalButton.waitFor({ state: "visible", timeout: 8000 });
        await ellipsisVerticalButton.click({ force: true });
      } catch {
        if (await openOptions.isVisible()) {
          await openOptions.click({ force: true });
        } else if (await legacyThreeDot.isVisible()) {
          await legacyThreeDot.click({ force: true });
        } else {
          const allButtons = await this.page
            .locator("button")
            .evaluateAll((elements) => elements.map((el) => (el.textContent || "").trim()).filter(Boolean).slice(0, 20));
          throw new Error(`Could not find 3-dot or Open options before edit. Buttons: ${allButtons.join(" || ")}`);
        }
      }
      await this.playwrightActionsFactory.waitForSec(0.5);
      await this.locators.editContactMenuItem.locator.click({ force: true });
      await this.playwrightActionsFactory.waitForSec(1);
    }
    if (!(await this.hasContactFormVisible())) {
      const buttonTexts = await this.page
        .locator("button")
        .evaluateAll((elements) => elements.map((el) => (el.textContent || "").trim()).filter(Boolean).slice(0, 30));
      const menuTexts = await this.page
        .locator('[role="menuitem"], [role="menu"] button, [role="menu"] a')
        .evaluateAll((elements) => elements.map((el) => (el.textContent || "").trim()).filter(Boolean).slice(0, 30));
      throw new Error(`Edit form did not open. Buttons: ${buttonTexts.join(" || ")}. Menu items: ${menuTexts.join(" || ")}`);
    }
    await this.fillContactForm(updatedFirstName, updatedLastName, updatedEmail);
    await this.assertContactFormEmailValue(updatedEmail);
    await this.saveEditedContact();
    await this.page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await this.page
      .getByText(new RegExp(`\\b${updatedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"))
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
  }

  async deleteOpenedContactFromThreeDot(): Promise<void> {
    const menuScope = this.activeContactPanel ?? this.activeContactResultRow ?? this.page;
    const ellipsisVerticalButton = menuScope
      .locator("xpath=.//button[.//*[name()='svg' and @data-qa='ellipsis_vertical']]")
      .or(this.page.locator("//button[.//*[name()='svg' and @data-qa='ellipsis_vertical']]"))
      .first();
    const openOptions = menuScope.getByRole("button", { name: /open options/i }).first();
    const fallbackMenuButton = menuScope
      .getByRole("button", { name: /more|options|menu|actions|open menu/i })
      .first();

    if (await ellipsisVerticalButton.isVisible().catch(() => false)) {
      await ellipsisVerticalButton.click({ force: true });
    } else if (await openOptions.isVisible().catch(() => false)) {
      await openOptions.click({ force: true });
    } else if (await fallbackMenuButton.isVisible().catch(() => false)) {
      await fallbackMenuButton.click({ force: true });
    } else {
      throw new Error("Could not find 3-dot menu button for contact delete action.");
    }

    await this.playwrightActionsFactory.waitForSec(0.5);
    await this.locators.deleteContactMenuItem.locator.click({ force: true });
    await this.playwrightActionsFactory.waitForSec(0.5);

    if (await this.locators.confirmDeleteContactButton.locator.isVisible().catch(() => false)) {
      await this.locators.confirmDeleteContactButton.locator.click({ force: true });
    }
  }

  async verifyContactDeletedToast(): Promise<void> {
    await expect(this.locators.contactDeletedToast.locator).toBeVisible({ timeout: 15000 });
  }

  private async saveEditedContact(): Promise<void> {
    const formRoot = (await this.getVisibleContactFormRoot()) ?? this.page;

    const scopedSave = formRoot
      .getByRole("button", { name: /save changes|update contact|save contact|apply changes/i })
      .first()
      .or(formRoot.locator('button[type="submit"]').filter({ hasText: /save changes|update|save contact/i }).first());

    try {
      await scopedSave.waitFor({ state: "visible", timeout: 6000 });
      await scopedSave.click({ force: true });
      await this.playwrightActionsFactory.waitForSec(1);
      return;
    } catch {
      // fall through
    }

    if (await this.locators.saveEditedContactButton.locator.isVisible()) {
      await this.locators.saveEditedContactButton.locator.click({ force: true });
      await this.playwrightActionsFactory.waitForSec(1);
      return;
    }

    const fallbackSubmit = formRoot.locator('button[type="submit"]').filter({ hasText: /save|update/i }).first();
    if (await fallbackSubmit.isVisible().catch(() => false)) {
      await fallbackSubmit.click({ force: true });
      await this.playwrightActionsFactory.waitForSec(1);
      return;
    }

    const emailField = formRoot
      .getByRole("textbox", { name: /^email$/i })
      .or(formRoot.getByLabel(/^email$/i))
      .or(formRoot.locator('input[type="email"], input[name="email"]').first())
      .first();
    await emailField.press("Tab").catch(() => {});
    await emailField.press("Enter");
    await this.playwrightActionsFactory.waitForSec(1);
  }

  async verifyContactNameInSearchResults(expectedName: string): Promise<void> {
    const createdContactResult: LocatorInfo = {
      description: `Created contact "${expectedName}" in search results`,
      locator: this.page.getByText(new RegExp(`^\\s*${expectedName}\\s*$`, "i")).first(),
    };
    await this.playwrightVerificationFactory.expectElementExist(createdContactResult);
    await expect(createdContactResult.locator).toBeVisible();
  }

  async verifyContactByEmailInSearchResults(expectedEmail: string): Promise<void> {
    const createdContactByEmailResult: LocatorInfo = {
      description: `Created contact with email "${expectedEmail}" in search results`,
      locator: this.page.getByText(new RegExp(`\\b${expectedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")).first(),
    };
    await this.playwrightVerificationFactory.expectElementExist(createdContactByEmailResult);
    await expect(createdContactByEmailResult.locator).toBeVisible();
  }

  async uploadDocumentInOpenedContact(filePathOrName: string): Promise<string> {
    const uploadScope = this.activeContactPanel ?? this.page;
    const fileInput: LocatorInfo = {
      description: "Contact document upload input",
      locator: uploadScope
        .locator(
          'input[type="file"], input[type="file"][accept*="pdf"], input[type="file"][accept*="doc"], input[type="file"][accept*="txt"]'
        )
        .first(),
    };
    const absoluteFilePath = path.isAbsolute(filePathOrName) ? filePathOrName : path.resolve(process.cwd(), filePathOrName);
    await fileInput.locator.waitFor({ state: "attached", timeout: 15000 });
    await this.playwrightActionsFactory.setInputFiles(fileInput, absoluteFilePath);
    await this.playwrightActionsFactory.waitForSec(1);

    return path.basename(absoluteFilePath);
  }

  async verifyUploadedDocumentName(expectedFileName: string): Promise<void> {
    const escapedName = expectedFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const uploadScope = this.activeContactPanel ?? this.page;
    const uploadedDocumentNameLocator: LocatorInfo = {
      description: `Uploaded document name "${expectedFileName}"`,
      locator: uploadScope.getByText(new RegExp(`\\b${escapedName}\\b`, "i")).first(),
    };
    if (await uploadedDocumentNameLocator.locator.isVisible().catch(() => false)) {
      return;
    }

    // Some environments rename uploaded files (UUID + original extension), so fallback to generic file visibility.
    const expectedExtension = path.extname(expectedFileName).toLowerCase();
    const uploadedDocumentFallback = uploadScope
      .getByText(new RegExp(`${expectedExtension.replace(".", "\\.")}\\b`, "i"))
      .or(
        uploadScope
          .getByRole("link", { name: /download/i })
          .or(uploadScope.getByRole("button", { name: /download/i }))
          .first()
      )
      .first();
    await expect(uploadedDocumentFallback).toBeVisible({ timeout: 15000 });
  }

  async downloadUploadedDocument(expectedFileName: string): Promise<void> {
    const escapedName = expectedFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const fileNamePattern = new RegExp(`\\b${escapedName}\\b`, "i");
    const uploadScope = this.activeContactPanel ?? this.page;

    const fileRow = uploadScope.locator("tr, li, article, section, div").filter({ hasText: fileNamePattern }).first();
    const scopedDownloadTrigger = fileRow
      .getByRole("link", { name: /download/i })
      .or(fileRow.getByRole("button", { name: /download/i }))
      .or(fileRow.locator('[data-testid*="download"], [data-test*="download"], a[download], button[aria-label*="download"]'))
      .first();
    const fallbackDownloadTrigger = uploadScope
      .getByRole("link", { name: fileNamePattern })
      .or(uploadScope.getByRole("button", { name: fileNamePattern }))
      .or(uploadScope.locator("a[download]").filter({ hasText: fileNamePattern }))
      .first();
    const genericDownloadTrigger = uploadScope
      .getByRole("link", { name: /download/i })
      .or(uploadScope.getByRole("button", { name: /download/i }))
      .or(uploadScope.locator('[data-testid*="download"], [data-test*="download"], a[download], button[aria-label*="download"]'))
      .first();

    const trigger = (await scopedDownloadTrigger.isVisible().catch(() => false))
      ? scopedDownloadTrigger
      : (await fallbackDownloadTrigger.isVisible().catch(() => false))
        ? fallbackDownloadTrigger
        : genericDownloadTrigger;
    await expect(trigger).toBeVisible({ timeout: 15000 });

    const [download] = await Promise.all([this.page.waitForEvent("download", { timeout: 20000 }), trigger.click({ force: true })]);
    const suggestedFilename = download.suggestedFilename();
    const expectedExtension = path.extname(expectedFileName).toLowerCase();
    if (expectedExtension) {
      await expect(suggestedFilename.toLowerCase()).toMatch(new RegExp(`${expectedExtension.replace(".", "\\.")}$`));
    } else {
      await expect(suggestedFilename.length).toBeGreaterThan(0);
    }
  }

  private async openCreateContactFormIfNeeded(): Promise<void> {
    if (await this.hasContactFormVisible()) {
      return;
    }
    const closeWrongDialogIfAny = async (): Promise<void> => {
      const confirmInput = this.page.locator('input[name="confirm_input"]').first();
      if (await confirmInput.isVisible().catch(() => false)) {
        await this.page.keyboard.press("Escape").catch(() => {});
        const cancelButton = this.page.getByRole("button", { name: /^cancel$/i }).first();
        if (await cancelButton.isVisible().catch(() => false)) {
          await cancelButton.click({ force: true }).catch(() => {});
        }
        await this.playwrightActionsFactory.waitForSec(0.3);
      }
    };

    const clickCreateContactFromMenuIfPresent = async (): Promise<void> => {
      const explicitCreate = this.page
        .getByRole("menuitem", { name: /create contact|individual contact|new contact/i })
        .or(this.page.getByRole("button", { name: /create contact|individual contact|new contact/i }))
        .or(this.page.getByRole("link", { name: /create contact|individual contact|new contact/i }))
        .first();
      if (await explicitCreate.isVisible().catch(() => false)) {
        await explicitCreate.click({ force: true });
        await this.playwrightActionsFactory.waitForSec(0.5);
      }
    };

    const createCandidates = this.page.locator(
      'button:has-text("Create contact"), a:has-text("Create contact"), [data-testid*="create-contact"], [data-test*="create-contact"]'
    );
    const total = await createCandidates.count();
    for (let index = 0; index < total; index++) {
      const candidate = createCandidates.nth(index);
      if (!(await candidate.isVisible())) {
        continue;
      }
      await candidate.click();
      await this.playwrightActionsFactory.waitForSec(0.5);
      await clickCreateContactFromMenuIfPresent();
      if (await this.hasContactFormVisible()) {
        return;
      }
      await closeWrongDialogIfAny();
    }
    // fallback to existing primary locator click for compatibility
    await this.playwrightActionsFactory.click(this.locators.createContactButton);
    await this.playwrightActionsFactory.waitForSec(0.5);
    await clickCreateContactFromMenuIfPresent();
    await closeWrongDialogIfAny();

    if (!(await this.hasContactFormVisible())) {
      const buttonTexts = await this.page
        .locator("button")
        .evaluateAll((elements) => elements.map((el) => (el.textContent || "").trim()).filter(Boolean).slice(0, 30));
      throw new Error(`Create contact form did not open. Visible buttons: ${buttonTexts.join(" || ")}`);
    }
  }

  private toLocatorInfo(description: string, locator: Locator): LocatorInfo {
    return { description, locator };
  }

  /**
   * Contact create/edit fields must be scoped to the visible drawer or top dialog so the global
   * `.first()` email input (e.g. wrong pane) is not filled during edit.
   */
  private async getVisibleContactFormRoot(): Promise<Locator | null> {
    if (this.activeContactPanel) {
      const formMarker = this.activeContactPanel.locator(
        'input[type="email"], input[name="email"], input[name="firstName"], input[name="first_name"]'
      ).first();
      if (await formMarker.isVisible().catch(() => false)) {
        return this.activeContactPanel;
      }
    }
    const dialogs = this.page.getByRole("dialog");
    const count = await dialogs.count();
    for (let index = count - 1; index >= 0; index--) {
      const dialog = dialogs.nth(index);
      if (!(await dialog.isVisible().catch(() => false))) {
        continue;
      }
      const emailVisible = await dialog
        .locator('input[type="email"], input[name="email"]')
        .first()
        .isVisible()
        .catch(() => false);
      const firstVisible = await dialog
        .getByRole("textbox", { name: /first name/i })
        .first()
        .isVisible()
        .catch(() => false);
      if (emailVisible || firstVisible) {
        return dialog;
      }
    }
    return null;
  }

  private async assertContactFormEmailValue(expectedEmail: string): Promise<void> {
    const formRoot = (await this.getVisibleContactFormRoot()) ?? this.page;
    const emailInput = formRoot
      .getByRole("textbox", { name: /^email$/i })
      .or(formRoot.getByLabel(/^email$/i))
      .or(formRoot.locator('input[type="email"], input[name="email"]').first())
      .first();
    await expect(emailInput).toHaveValue(expectedEmail, { timeout: 8000 });
  }

  private async fillContactForm(firstName: string, lastName: string, email: string): Promise<void> {
    const formRootResolved = await this.getVisibleContactFormRoot();
    const formRoot = formRootResolved ?? this.page;
    const inputsHost = formRootResolved ?? this.page.getByRole("dialog").last();

    const firstNameInput = formRoot
      .getByRole("textbox", { name: /first name/i })
      .or(formRoot.getByLabel(/first name/i))
      .or(formRoot.locator('input[name="firstName"], input[name="first_name"], input[placeholder*="First"]').first())
      .first();
    const lastNameInput = formRoot
      .getByRole("textbox", { name: /last name/i })
      .or(formRoot.getByLabel(/last name/i))
      .or(formRoot.locator('input[name="lastName"], input[name="last_name"], input[placeholder*="Last"]').first())
      .first();
    const fullNameInput = formRoot
      .getByRole("textbox", { name: /^name$/i })
      .or(formRoot.getByLabel(/^name$/i))
      .or(formRoot.locator('input[name="name"], input[placeholder*="Name"]').first())
      .first();
    const emailInput = formRoot
      .getByRole("textbox", { name: /^email$/i })
      .or(formRoot.getByLabel(/^email$/i))
      .or(formRoot.locator('input[type="email"], input[name="email"], input[placeholder*="Email"]').first())
      .first();

    const searchLike = this.page.locator(
      'input[name="query"], input[name="search"], input[placeholder*="Search"], input[placeholder*="Find contacts"]'
    );
    const dialogInputs = inputsHost
      .locator("input")
      .filter({ hasNot: searchLike })
      .filter({ hasNot: this.page.locator('input[name="confirm_input"]') });

    const hasFirstNameField = await firstNameInput.isVisible();
    const hasFullNameField = await fullNameInput.isVisible();
    const hasEmailField = await emailInput.isVisible();

    if (!hasEmailField && (await dialogInputs.count()) >= 2) {
      await dialogInputs.nth(0).fill(`${firstName} ${lastName}`);
      await dialogInputs.nth(1).fill(email);
      return;
    }

    if (!hasEmailField) {
      const inputHints = await this.page
        .locator("input")
        .evaluateAll((elements) =>
          elements
            .map((el) => `${el.getAttribute("name") || ""}|${el.getAttribute("placeholder") || ""}|${el.getAttribute("type") || ""}`)
            .slice(0, 20)
        );
      throw new Error(`Contact form email input not visible. Inputs: ${inputHints.join(" || ")}`);
    }

    if (hasFirstNameField) {
      await this.playwrightActionsFactory.sendKeys(this.toLocatorInfo("First name input", firstNameInput), firstName);
      await this.playwrightActionsFactory.sendKeys(this.toLocatorInfo("Last name input", lastNameInput), lastName);
    } else if (hasFullNameField) {
      await this.playwrightActionsFactory.sendKeys(this.toLocatorInfo("Full name input", fullNameInput), `${firstName} ${lastName}`);
    } else {
      const inputHints = await this.page
        .locator("input")
        .evaluateAll((elements) =>
          elements
            .map((el) => `${el.getAttribute("name") || ""}|${el.getAttribute("placeholder") || ""}|${el.getAttribute("type") || ""}`)
            .slice(0, 20)
        );
      throw new Error(`Contact form name input not visible. Inputs: ${inputHints.join(" || ")}`);
    }

    await this.playwrightActionsFactory.sendKeys(this.toLocatorInfo("Email input", emailInput), email);
  }

  private async waitForContactsPageReady(): Promise<void> {
    try {
      await Promise.race([
        this.locators.createContactButton.locator.waitFor({ state: "visible", timeout: 20000 }),
        this.locators.searchInput.locator.waitFor({ state: "visible", timeout: 20000 }),
      ]);
    } catch {
      const buttonTexts = await this.page
        .locator("button")
        .evaluateAll((elements) => elements.map((el) => (el.textContent || "").trim()).filter(Boolean).slice(0, 20));
      const inputHints = await this.page
        .locator("input")
        .evaluateAll((elements) =>
          elements
            .map((el) => `${el.getAttribute("name") || ""}|${el.getAttribute("placeholder") || ""}|${el.getAttribute("type") || ""}`)
            .slice(0, 20)
        );
      throw new Error(
        `Contacts page loaded but neither create button nor search input became visible. Current URL: ${this.page.url()}. Buttons: ${buttonTexts.join(" || ")}. Inputs: ${inputHints.join(" || ")}`
      );
    }
  }

  private async isContactsPageReady(timeoutMs: number): Promise<boolean> {
    try {
      await Promise.race([
        this.locators.createContactButton.locator.waitFor({ state: "visible", timeout: timeoutMs }),
        this.locators.searchInput.locator.waitFor({ state: "visible", timeout: timeoutMs }),
      ]);
      return true;
    } catch {
      return false;
    }
  }

  private async hasContactFormVisible(): Promise<boolean> {
    if (
      (await this.locators.firstNameInput.locator.isVisible()) ||
      (await this.locators.fullNameInput.locator.isVisible()) ||
      (await this.locators.emailInput.locator.isVisible())
    ) {
      return true;
    }
    const dialogInputs = this.page
      .getByRole("dialog")
      .locator("input")
      .filter({
        hasNot: this.page.locator(
          'input[name="query"], input[name="search"], input[placeholder*="Search"], input[placeholder*="Find contacts"], input[name="confirm_input"]'
        ),
      });
    return (await dialogInputs.count()) >= 2;
  }

  /**
   * Scope for meetings sub-tabs inside an opened contact (Past meetings: Upcoming, All past, AI-processed, Needs Action).
   */
  private async getOpenedContactDetailScope(): Promise<Locator> {
    if (this.activeContactPanel) {
      return this.activeContactPanel;
    }

    const fallbackCandidates = [
      this.page.getByRole("dialog").last(),
      this.page.locator("aside").first(),
      this.page.locator('[data-testid*="drawer"], [data-testid*="panel"]').first(),
      this.page.locator("main").first(),
      this.page.locator('[role="main"]').first(),
      this.page.locator("body").first(),
    ];

    for (const candidate of fallbackCandidates) {
      const visible = await candidate.isVisible().catch(() => false);
      if (!visible) {
        continue;
      }
      const pastMeetingName = /Upcoming|All past|AI[-\s]?Processed|Needs Action/i;
      const hasPastMeetingTabs = await candidate
        .getByRole("tab", { name: pastMeetingName })
        .or(candidate.getByRole("radio", { name: pastMeetingName }))
        .or(candidate.getByRole("button", { name: pastMeetingName }))
        .first()
        .isVisible()
        .catch(() => false);
      const hasMeetingPrep = await candidate
        .getByRole("tab", { name: /meeting prep|pre-meeting prep|pre meeting prep/i })
        .or(candidate.getByRole("button", { name: /meeting prep|pre-meeting prep|pre meeting prep/i }))
        .first()
        .isVisible()
        .catch(() => false);
      if (hasPastMeetingTabs || hasMeetingPrep) {
        this.activeContactPanel = candidate;
        return candidate;
      }
    }

    throw new Error(
      "Contact detail scope not found. Ensure contact opens into a detail panel/page before navigating Past meetings tabs."
    );
  }

  private scopedPastMeetingsTab(panel: Locator, label: string, namePattern: RegExp): LocatorInfo {
    return {
      description: `Past meetings tab "${label}" in contact panel`,
      locator: panel
        .getByRole("tab", { name: namePattern })
        .or(panel.getByRole("menuitem", { name: namePattern }))
        .or(panel.getByRole("option", { name: namePattern }))
        .or(panel.getByRole("link", { name: namePattern }))
        .or(panel.getByRole("button", { name: namePattern }))
        .or(panel.locator("[role='tab'], [role='menuitem'], [role='option'], button, a").filter({ hasText: namePattern }).first())
        .first(),
    };
  }

  private async openPastMeetingsChooserIfPresent(panel: Locator): Promise<void> {
    const trigger = panel
      .getByRole("button", { name: /past meetings?/i })
      .or(panel.getByRole("tab", { name: /past meetings?/i }))
      .or(panel.getByRole("link", { name: /past meetings?/i }))
      .or(panel.locator("button, a, [role='tab']").filter({ hasText: /past meetings?/i }).first())
      .first();
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click({ force: true });
      await this.playwrightActionsFactory.waitForSec(0.5);
    }
  }

  /** Expands Past meetings only when filter controls are not already visible (avoids toggle-closing an open section). */
  private async ensurePastMeetingsFiltersVisible(panel: Locator): Promise<void> {
    const filterTabDetectionPattern = /Upcoming|All past|AI[-\s]?Processed|Needs Action/i;
    const filterControl = panel
      .getByRole("tab", { name: filterTabDetectionPattern })
      .or(panel.getByRole("radio", { name: filterTabDetectionPattern }))
      .or(panel.getByRole("button", { name: filterTabDetectionPattern }))
      .first();
    if (await filterControl.isVisible().catch(() => false)) {
      return;
    }
    await this.openPastMeetingsChooserIfPresent(panel);
  }

  /**
   * Clicks a Past meetings row filter (Upcoming, All past, AI-processed, Needs Action) inside the contact panel.
   * Waits until the control is visible so steps are not skipped silently.
   */
  private async clickPastMeetingsFilterStep(
    panel: Locator,
    step: { label: string; pattern: RegExp }
  ): Promise<void> {
    const tabInfo = this.scopedPastMeetingsTab(panel, step.label, step.pattern);
    const target = tabInfo.locator.first();
    await expect(target).toBeVisible({ timeout: 12000 });
    await target.scrollIntoViewIfNeeded();
    await this.playwrightActionsFactory.click(tabInfo);
    await this.playwrightActionsFactory.waitForSec(1);
    await this.assertContactPanelTabSelected(panel, step.pattern).catch(async () => {
      await expect(tabInfo.locator.first()).toBeVisible({ timeout: 5000 });
    });
  }

  private async assertContactPanelTabSelected(panel: Locator, namePattern: RegExp): Promise<void> {
    const tab = panel
      .getByRole("tab", { name: namePattern })
      .or(panel.getByRole("button", { name: namePattern }))
      .or(panel.getByRole("menuitem", { name: namePattern }))
      .first();
    await tab.waitFor({ state: "visible", timeout: 10000 });
    await expect
      .poll(
        async () => {
          const ariaSelected = await tab.getAttribute("aria-selected");
          const dataState = await tab.getAttribute("data-state");
          const pressed = await tab.getAttribute("aria-pressed");
          const ariaCurrent = await tab.getAttribute("aria-current");
          const className = (await tab.getAttribute("class")) || "";
          return (
            ariaSelected === "true" ||
            dataState === "active" ||
            pressed === "true" ||
            ariaCurrent === "page" ||
            /\bactive\b|\bselected\b/i.test(className)
          );
        },
        { timeout: 10000 }
      )
      .toBeTruthy();
  }

  /**
   * Clicks each Past meetings filter tab on the opened contact in order: Upcoming → All past → AI-processed → Needs Action.
   * Asserts each tab becomes selected so no option is skipped.
   */
  async runContactPastMeetingsTabsFlow(): Promise<void> {
    const panel = await this.getOpenedContactDetailScope();
    const steps: Array<{ label: string; pattern: RegExp }> = [
      { label: "Upcoming", pattern: /^Upcoming\b/ },
      { label: "All past", pattern: /^All past\b/ },
      { label: "AI-processed", pattern: /^AI[-\s]?Processed$/i },
      { label: "Needs Action", pattern: /^Needs Action\b/ },
    ];

    const pastMeetingsTrigger = panel
      .getByRole("button", { name: /past meetings?/i })
      .or(panel.getByRole("tab", { name: /past meetings?/i }))
      .or(panel.getByRole("link", { name: /past meetings?/i }))
      .or(panel.locator("button, a, [role='tab']").filter({ hasText: /past meetings?/i }).first())
      .first();

    const runChooserThenTabFlow = async (): Promise<void> => {
      await this.ensurePastMeetingsFiltersVisible(panel);
      for (const step of steps) {
        const tabInfo = this.scopedPastMeetingsTab(panel, step.label, step.pattern);
        if ((await tabInfo.locator.count()) === 0) {
          continue;
        }
        await this.clickPastMeetingsFilterStep(panel, step);
      }
    };

    const triggerVisible = await pastMeetingsTrigger.isVisible().catch(() => false);
    if (!triggerVisible) {
      await runChooserThenTabFlow();
      return;
    }

    await pastMeetingsTrigger.click({ force: true });
    await this.playwrightActionsFactory.waitForSec(0.5);

    const filterTabDetectionPattern = /Upcoming|All past|AI[-\s]?Processed|Needs Action/i;
    const inlineFilterTabs = panel
      .getByRole("tab", { name: filterTabDetectionPattern })
      .or(panel.getByRole("radio", { name: filterTabDetectionPattern }))
      .or(panel.getByRole("button", { name: filterTabDetectionPattern }));
    const dropdownChoices = this.page
      .getByRole("menuitem", { name: filterTabDetectionPattern })
      .or(this.page.getByRole("option", { name: filterTabDetectionPattern }));

    const inlineVisible = await inlineFilterTabs.first().isVisible().catch(() => false);
    const dropdownVisible = await dropdownChoices.first().isVisible().catch(() => false);

    if (!inlineVisible && !dropdownVisible) {
      try {
        await expect
          .poll(
            async () =>
              (await inlineFilterTabs.first().isVisible().catch(() => false)) ||
              (await dropdownChoices.first().isVisible().catch(() => false)),
            { timeout: 10000 }
          )
          .toBeTruthy();
      } catch {
        await runChooserThenTabFlow();
        return;
      }
    }

    const inlineReady = await inlineFilterTabs.first().isVisible().catch(() => false);
    if (inlineReady) {
      for (const step of steps) {
        const tabInfo = this.scopedPastMeetingsTab(panel, step.label, step.pattern);
        if ((await tabInfo.locator.count()) === 0) {
          continue;
        }
        await this.clickPastMeetingsFilterStep(panel, step);
      }
      return;
    }

    const optionContainer = this.page
      .getByRole("menu")
      .filter({ has: this.page.getByRole("menuitem", { name: filterTabDetectionPattern }) })
      .or(
        this.page.getByRole("listbox").filter({
          has: this.page.getByRole("option", { name: filterTabDetectionPattern }),
        })
      )
      .or(
        this.page.locator("[data-radix-popper-content-wrapper]").filter({
          has: this.page.getByRole("menuitem").or(this.page.getByRole("option")),
        })
      )
      .first();

    const options = optionContainer
      .getByRole("menuitem")
      .or(optionContainer.getByRole("option"))
      .or(
        optionContainer.locator("button, a").filter({
          hasText: filterTabDetectionPattern,
        })
      )
      .filter({ hasNotText: /past meetings?/i });

    const optionCount = await options.count();
    if (optionCount === 0) {
      await runChooserThenTabFlow();
      return;
    }

    for (const step of steps) {
      await pastMeetingsTrigger.click({ force: true });
      await this.playwrightActionsFactory.waitForSec(0.3);
      const optionToClick = optionContainer
        .getByRole("menuitem", { name: step.pattern })
        .or(optionContainer.getByRole("option", { name: step.pattern }))
        .or(optionContainer.getByRole("button", { name: step.pattern }))
        .or(optionContainer.getByRole("link", { name: step.pattern }))
        .first();
      await optionToClick.waitFor({ state: "visible", timeout: 10000 });
      await optionToClick.click({ force: true });
      await this.playwrightActionsFactory.waitForSec(1);
    }
  }

  /**
   * Opens Meeting prep (or Pre-meeting prep) on the opened contact detail panel.
   */
  async clickMeetingPrepInContactPanel(): Promise<void> {
    const panel = await this.getOpenedContactDetailScope();
    const meetingPrepTab: LocatorInfo = {
      description: "Meeting prep / Pre-meeting prep tab or control in contact detail",
      locator: panel
        .getByRole("tab", { name: /meeting prep|pre-meeting prep|pre meeting prep/i })
        .or(panel.getByRole("link", { name: /meeting prep|pre-meeting prep|pre meeting prep/i }))
        .or(panel.getByRole("button", { name: /meeting prep|pre-meeting prep|pre meeting prep/i }))
        .first(),
    };
    await meetingPrepTab.locator.waitFor({ state: "visible", timeout: 20000 });
    await this.playwrightActionsFactory.click(meetingPrepTab);
    await this.playwrightActionsFactory.waitForSec(1);
  }

  /**
   * Verifies Meeting prep (or Pre-meeting prep) content is visible in the contact panel.
   */
  async verifyMeetingPrepSectionVisibleInContactPanel(): Promise<void> {
    const panel = await this.getOpenedContactDetailScope();
    const marker: LocatorInfo = {
      description: "Meeting prep section heading or label",
      locator: panel
        .getByRole("heading", { name: /meeting prep|pre-meeting prep|pre meeting prep/i })
        .or(panel.getByText(/meeting prep|pre-meeting prep|pre meeting prep/i).first()),
    };
    await this.playwrightVerificationFactory.expectElementExist(marker);
    await expect(marker.locator).toBeVisible({ timeout: 20000 });
  }

  /**
   * Some contact lists open details only when the name/link is clicked, not the full row.
   */
  private async openRowByNameOrPrimaryAction(row: Locator, emailRegex: RegExp): Promise<void> {
    const clickableName = row
      .locator(
        '[data-testid*="contact-name"], [data-test*="contact-name"], a, [role="link"], button[aria-label*="open"], button[aria-label*="view"]'
      )
      .filter({ hasNotText: /open options|more|menu|actions/i })
      .first();

    if (await clickableName.isVisible()) {
      await clickableName.click({ timeout: 3000 });
      return;
    }

    const textNodeCandidate = row
      .locator("span, div, p")
      .filter({ hasNotText: /open options|sort by|create contact/i })
      .filter({ hasNot: row.locator("input, textarea, select") })
      .first();
    if (await textNodeCandidate.isVisible()) {
      await textNodeCandidate.click({ timeout: 3000 });
      return;
    }

    if (await row.isVisible()) {
      await row.click({ timeout: 3000 });
    }

    const panelCandidates = [
      this.page.getByRole("dialog").filter({ hasText: emailRegex }),
      this.page.locator("aside").filter({ hasText: emailRegex }),
      this.page.locator('[data-testid*="drawer"], [data-testid*="panel"]').filter({ hasText: emailRegex }),
    ];
    for (const candidate of panelCandidates) {
      if (await candidate.first().isVisible()) {
        return;
      }
    }
  }
}
