import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { LocatorInfo } from "@interfaces/locator.info.interface";
import { PlaywrightActionFactory } from "@utilities/playwright.actions.utils";
import { PlaywrightVerificationFactory } from "@utilities/playwright.verifications.utils";

export class HomePage {
  private readonly page: Page;
  private readonly playwrightActionsFactory: PlaywrightActionFactory;
  private readonly playwrightVerificationsFactory: PlaywrightVerificationFactory;
  private readonly locators: { [key: string]: LocatorInfo };

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.playwrightActionsFactory = new PlaywrightActionFactory(page, testInfo);
    this.playwrightVerificationsFactory = new PlaywrightVerificationFactory(page, testInfo);
    this.locators = {
      todaysMeetingsSection: {
        description: "Today's meetings section on Home",
        locator: page.getByRole("heading", { name: /today'?s meetings/i })
          .or(page.locator("h2, h3").filter({ hasText: /today'?s meetings/i }))
          .locator(".."),
      },
      noMeetingsScheduled: {
        description: "No meetings scheduled message",
        locator: page.getByText(/no meetings scheduled\.?/i),
      },
      firstMeetingThreeDotButton: {
        description: "First meeting 3-dot menu button in Today's meetings",
        locator: page
          .locator("[data-testid='todays-meetings'], section, div")
          .filter({ has: page.getByText(/today'?s meetings/i) })
          .first()
          .locator("..")
          .locator("button.inline-flex.items-center.justify-center.rounded-md")
          .or(page.getByRole("button", { name: /more|options|menu/i }))
          .first(),
      },
      makePrivateOption: {
        description: "Make private menu option (prefer overflow menu with meeting actions)",
        locator: page.getByRole("menuitem", { name: /make\s*(?:it\s*)?private|set\s*(?:as\s*)?private|mark\s*(?:as\s*)?private/i }),
      },
      makePublicOption: {
        description: "Make public / remove private menu option",
        locator: page.getByRole("menuitem", {
          name: /make\s*public|remove\s*private|mark\s*as\s*public|change\s+to\s+public|set\s*as\s+public|turn\s+public|not\s*private/i,
        }),
      },
      privateEventLabel: {
        description: "Private Event label on meeting card in Today's meetings",
        locator: page
          .getByText(/today'?s meetings/i)
          .locator("..")
          .locator("[data-test-id='meeting-card']")
          .first()
          .getByText(/private event|^private$/i),
      },
      viewAllUpcomingMeetingsButton: {
        description: "View all Upcoming meetings button/link in Today's meetings",
        locator: page
          .getByRole("link", { name: /view all.*upcoming|upcoming.*meetings/i })
          .or(page.locator("a[href*='meetings'][href*='filter=upcoming']").filter({ hasText: /view all|upcoming/i })),
      },
      appHomeShell: {
        description: "Home shell ready (New meeting sidebar trigger)",
        locator: page.locator("#new-meeting-menu-trigger"),
      },
    };
  }

  /**
   * Scrolls the main document to the bottom (e.g. booking windows list below the fold).
   */
  async scrollPageToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    await this.playwrightActionsFactory.waitForSec(1);
  }

  /**
   * Scrolls to the page bottom, then asserts the created booking window name is visible (section may lazy-load).
   */
  async expectBookingWindowNameVisibleAtPageBottom(bookingWindowName: string): Promise<void> {
    await this.scrollPageToBottom();
    const label = this.page.getByText(bookingWindowName, { exact: false }).last();
    await expect(label).toBeVisible({ timeout: 45000 });
    await label.scrollIntoViewIfNeeded({ timeout: 10000 });
  }

  /**
   * Opens base URL and waits for home UI. Avoids networkidle (SPAs often never go idle).
   */
  async navigateToHome(baseUrl: string): Promise<void> {
    const url = baseUrl.replace(/\/$/, "");
    await this.playwrightActionsFactory.navigateToURL(url);
    await this.page.waitForLoadState("domcontentloaded", { timeout: 20000 });
    await this.playwrightActionsFactory.waitForSelector(this.locators.appHomeShell, 20000, "visible");
  }

  /** Returns true if "No meetings scheduled." (or similar) is visible within timeout. */
  async isNoMeetingsScheduledVisible(timeoutMs = 5000): Promise<boolean> {
    try {
      await this.locators.noMeetingsScheduled.locator.waitFor({ state: "visible", timeout: timeoutMs });
      return true;
    } catch {
      return false;
    }
  }

  /** Click the first meeting card in Today's meetings to open meeting detail view. Uses data-test-id="meeting-card". */
  async clickFirstMeeting(): Promise<void> {
    const section = this.page.getByText(/today'?s meetings/i).locator("..");
    const firstMeetingCard = section.locator("[data-test-id='meeting-card']").first();
    await firstMeetingCard.waitFor({ state: "visible", timeout: 15000 });
    await firstMeetingCard.click();
  }

  /** Expect current URL to match meeting detail: /meetings/mtg_... or /prepare/int_ref_... */
  async expectMeetingDetailUrl(baseUrl: string): Promise<void> {
    const base = baseUrl.replace(/\/$/, "");
    const baseEscaped = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const meetingDetailRegex = new RegExp(`^${baseEscaped}/(meetings/mtg_|prepare/int_ref_[a-zA-Z0-9]+)`);
    await this.page.waitForURL(meetingDetailRegex, { timeout: 15000 });
    await expect(this.page).toHaveURL(/\/(meetings\/mtg_|prepare\/int_ref_[a-zA-Z0-9]+)/);
    await this.playwrightActionsFactory.waitForSec(2);
  }

  /** Returns true if "View all Upcoming meetings" button/link is visible within timeout. */
  async isViewAllUpcomingMeetingsVisible(timeoutMs = 5000): Promise<boolean> {
    try {
      const section = this.page.getByText(/today'?s meetings/i).locator("..");
      const viewAllLink = section.locator("a[href*='meetings'][href*='filter=upcoming']").first();
      await viewAllLink.waitFor({ state: "visible", timeout: timeoutMs });
      return true;
    } catch {
      return false;
    }
  }

  /** Click "View all Upcoming meetings" link in Today's meetings section. */
  async clickViewAllUpcomingMeetings(): Promise<void> {
    const section = this.page.getByText(/today'?s meetings/i).locator("..");
    const viewAllLink = section.locator("a[href*='meetings'][href*='filter=upcoming']").first();
    await viewAllLink.waitFor({ state: "visible", timeout: 15000 });
    await viewAllLink.click();
  }

  /** Expect current URL to be /meetings?filter=upcoming. */
  async expectUpcomingMeetingsUrl(baseUrl: string): Promise<void> {
    const base = baseUrl.replace(/\/$/, "");
    await this.page.waitForURL(
      new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/meetings\\?filter=upcoming`),
      { timeout: 15000 }
    );
    await expect(this.page).toHaveURL(/\/meetings\?filter=upcoming/);
    await this.playwrightActionsFactory.waitForSec(2);
  }

  /** First meeting row/card under Today's meetings (matches Meetings list pattern). */
  private async firstTodaysMeetingCard(): Promise<Locator> {
    const section = this.page.getByText(/today'?s meetings/i).locator("..");
    const cards = section.locator("[data-test-id='meeting-card']");
    if ((await cards.count()) > 0) {
      return cards.first();
    }
    return section.locator("a[href*='/meetings/mtg_']").first();
  }

  /** Hover over the first meeting card so the 3-dot button becomes visible. */
  async hoverFirstMeetingCard(): Promise<void> {
    const firstCard = await this.firstTodaysMeetingCard();
    await firstCard.waitFor({ state: "visible", timeout: 15000 });
    await firstCard.hover();
    await this.playwrightActionsFactory.waitForSec(0.5);
  }

  /** Click the 3-dot on the first Today's meeting card (not the first SVG button in the whole section). */
  async clickFirstMeetingThreeDot(): Promise<void> {
    const card = await this.firstTodaysMeetingCard();
    await card.waitFor({ state: "visible", timeout: 15000 });
    await card.hover();
    await this.playwrightActionsFactory.waitForSec(0.5);
    const threeDot = card
      .getByRole("button", { name: /more|options|menu|actions|open menu/i })
      .or(card.locator("button").filter({ has: this.page.locator("svg") }))
      .first();
    await threeDot.waitFor({ state: "visible", timeout: 15000 });
    await threeDot.click();
    await this.playwrightActionsFactory.waitForSec(0.5);
  }

  private makePrivateItem(menuSurface: Locator): Locator {
    const label =
      /make\s*(?:it\s*)?private|set\s*(?:as\s*)?private|mark\s*(?:as\s*)?private|make\s*meeting\s*private/i;
    return menuSurface
      .getByRole("menuitem", { name: label })
      .or(menuSurface.getByRole("option", { name: label }))
      .or(menuSurface.locator("[role='menuitem'], [role='option']").filter({ hasText: label }))
      .or(menuSurface.locator('[role="presentation"]').filter({ hasText: label }))
      .or(menuSurface.locator("button, a").filter({ hasText: label }))
      .or(menuSurface.getByText(label))
      .first();
  }

  private makePublicItem(menuSurface: Locator): Locator {
    const label =
      /make\s*public|remove\s*private|mark\s*as\s*public|change\s+to\s+public|set\s*as\s+public|turn\s+public|not\s*private/i;
    return menuSurface
      .getByRole("menuitem", { name: label })
      .or(menuSurface.getByRole("option", { name: label }))
      .or(menuSurface.locator("[role='menuitem'], [role='option']").filter({ hasText: label }))
      .or(menuSurface.locator('[role="presentation"]').filter({ hasText: label }))
      .or(menuSurface.locator("button, a").filter({ hasText: label }))
      .or(menuSurface.getByText(label))
      .first();
  }

  /**
   * Dropdown surface for Today's meeting overflow (Radix/shadcn portals + role fallbacks).
   */
  private openMenuSurface(): Locator {
    return this.page
      .locator(
        "[data-radix-dropdown-menu-content], [data-slot=\"dropdown-menu-content\"], [data-radix-menu-content], [data-radix-popper-content-wrapper], [role=\"menu\"], [role=\"listbox\"]"
      )
      .filter({ visible: true })
      .last();
  }

  /**
   * After 3-dot menu is open: which visibility action is shown (mutually exclusive for a given meeting state).
   */
  private async detectInitialVisibilityAction(timeoutMs = 12000): Promise<"makePrivate" | "makePublic"> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const surface = this.openMenuSurface();
      if ((await surface.count()) === 0) {
        await this.playwrightActionsFactory.waitForSec(0.2);
        continue;
      }
      const priv = this.makePrivateItem(surface);
      const pub = this.makePublicItem(surface);
      try {
        await priv.waitFor({ state: "visible", timeout: 800 });
        return "makePrivate";
      } catch {
        try {
          await pub.waitFor({ state: "visible", timeout: 800 });
          return "makePublic";
        } catch {
          await this.playwrightActionsFactory.waitForSec(0.25);
        }
      }
    }
    throw new Error(
      'Neither "Make private" nor "Make public" was visible in the meeting overflow menu within timeout.'
    );
  }

  /** Try several locators (portal menus may omit role="menu"). */
  private async clickFirstMatchingVisible(description: string, candidates: Locator[]): Promise<void> {
    const perMs = 6000;
    const errors: string[] = [];
    for (let i = 0; i < candidates.length; i++) {
      const target = candidates[i].first();
      try {
        await target.waitFor({ state: "visible", timeout: perMs });
        await this.playwrightActionsFactory.click({ description, locator: target });
        return;
      } catch (e) {
        errors.push(`#${i}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    throw new Error(`${description} — tried ${candidates.length} locators: ${errors.join("; ")}`);
  }

  private async clickMakePrivateInOpenMenu(): Promise<void> {
    const label =
      /make\s*(?:it\s*)?private|set\s*(?:as\s*)?private|mark\s*(?:as\s*)?private|make\s*meeting\s*private/i;
    const surfaceHint =
      /make\s*private|make\s*public|remove|delete|edit|share|visibility|notetaker|duplicate|copy/i;
    const openSurface = this.page.locator('[data-state="open"]').filter({ visible: true, hasText: surfaceHint });
    const radixSurface = this.openMenuSurface();
    const candidates: Locator[] = [
      this.makePrivateItem(radixSurface),
      radixSurface.getByText(label),
      this.page.getByRole("menu").filter({ visible: true }).getByText(label),
      this.page.getByRole("listbox").filter({ visible: true }).getByText(label),
      openSurface.getByText(label),
      this.page.getByRole("menuitem", { name: label }).filter({ visible: true }),
      this.page.getByRole("option", { name: label }).filter({ visible: true }),
      this.page.getByRole("button", { name: label }).filter({ visible: true }),
      this.page.getByText(/^make\s*private$/i).filter({ visible: true }),
      this.makePrivateItem(this.page.locator('[role="menu"], [role="listbox"]').filter({ visible: true }).last()),
    ];
    await this.clickFirstMatchingVisible("Make private menu option", candidates);
  }

  private async clickMakePublicInOpenMenu(): Promise<void> {
    const label =
      /make\s*public|remove\s*private|mark\s*as\s*public|change\s+to\s+public|set\s*as\s+public|turn\s+public|not\s*private/i;
    const surfaceHint =
      /make\s*private|make\s*public|remove|delete|edit|share|visibility|notetaker|duplicate|copy/i;
    const openSurface = this.page.locator('[data-state="open"]').filter({ visible: true, hasText: surfaceHint });
    const radixSurface = this.openMenuSurface();
    const candidates: Locator[] = [
      this.makePublicItem(radixSurface),
      radixSurface.getByText(label),
      this.page.getByRole("menu").filter({ visible: true }).getByText(label),
      this.page.getByRole("listbox").filter({ visible: true }).getByText(label),
      openSurface.getByText(label),
      this.page.getByRole("menuitem", { name: label }).filter({ visible: true }),
      this.page.getByRole("option", { name: label }).filter({ visible: true }),
      this.page.getByRole("button", { name: label }).filter({ visible: true }),
      this.page.getByText(/^make\s*public$/i).filter({ visible: true }),
      this.page.getByText(/^remove\s*private$/i).filter({ visible: true }),
      this.makePublicItem(this.page.locator('[role="menu"], [role="listbox"]').filter({ visible: true }).last()),
    ];
    await this.clickFirstMatchingVisible("Make public menu option", candidates);
  }

  async clickMakePrivate(): Promise<void> {
    try {
      await this.clickMakePrivateInOpenMenu();
    } catch {
      await this.page.keyboard.press("Escape");
      await this.playwrightActionsFactory.waitForSec(0.4);
      await this.clickFirstMeetingThreeDot();
      await this.playwrightActionsFactory.waitForSec(1);
      await this.dismissChangeMeetingVisibilityModalIfPresent();
      await this.clickMakePrivateInOpenMenu();
    }
  }

  async clickMakePublic(): Promise<void> {
    try {
      await this.clickMakePublicInOpenMenu();
    } catch {
      await this.page.keyboard.press("Escape");
      await this.playwrightActionsFactory.waitForSec(0.4);
      await this.clickFirstMeetingThreeDot();
      await this.playwrightActionsFactory.waitForSec(1);
      await this.dismissChangeMeetingVisibilityModalIfPresent();
      await this.clickMakePublicInOpenMenu();
    }
  }

  async expectPrivateEventLabelVisible(): Promise<void> {
    await this.playwrightActionsFactory.waitForSec(2);
    await this.playwrightVerificationsFactory.waitForSelector(this.locators.privateEventLabel, 20000);
    await expect(this.locators.privateEventLabel.locator).toBeVisible();
  }

  async expectPrivateEventLabelNotVisible(): Promise<void> {
    await expect(this.locators.privateEventLabel.locator).not.toBeVisible();
  }

  /**
   * If "Change meeting visibility" modal is open (recurring meeting), wait 1s, click Confirm, wait 1s.
   * Modal can appear after clicking 3-dot or after clicking Make Private/Make Public.
   */
  async dismissChangeMeetingVisibilityModalIfPresent(): Promise<void> {
    try {
      const modalHeading = this.page.getByText("Change meeting visibility", { exact: false });
      await modalHeading.waitFor({ state: "visible", timeout: 2000 });
      await this.playwrightActionsFactory.waitForSec(1);
      const confirmBtn = this.page
        .locator("button.pc-button--primary.pc-button--md")
        .filter({ hasText: /Confirm/i })
        .first();
      await confirmBtn.waitFor({ state: "visible", timeout: 5000 });
      await confirmBtn.click();
      await this.playwrightActionsFactory.waitForSec(1);
    } catch {
      // Modal not present or already closed, continue
    }
  }

  /**
   * Run Home → Private meeting flow: if no meetings, assert "No meetings scheduled." and pass.
   * Otherwise: 3-dot → if meeting is already private (menu shows Make Public): one Make Public, assert Private
   * label is gone, reopen menu → one Make Private → verify Private Event → teardown: Make Public, label gone.
   * If meeting is already public (menu shows Make Private): Make Private once, verify label → teardown.
   */
  async runPrivateMeetingFlow(baseUrl: string): Promise<void> {
    await this.navigateToHome(baseUrl);

    const noMeetings = await this.isNoMeetingsScheduledVisible(5000);
    if (noMeetings) {
      await expect(this.locators.noMeetingsScheduled.locator).toBeVisible();
      return;
    }

    await this.clickFirstMeetingThreeDot();
    await this.playwrightActionsFactory.waitForSec(1);
    await this.dismissChangeMeetingVisibilityModalIfPresent();

    const visibilityAction = await this.detectInitialVisibilityAction();
    if (visibilityAction === "makePublic") {
      await this.clickMakePublicInOpenMenu();
      await this.dismissChangeMeetingVisibilityModalIfPresent();
      await this.playwrightActionsFactory.waitForSec(1);
      await this.expectPrivateEventLabelNotVisible();
      await this.page.keyboard.press("Escape");
      await this.playwrightActionsFactory.waitForSec(0.4);
      await this.clickFirstMeetingThreeDot();
      await this.playwrightActionsFactory.waitForSec(1);
      await this.dismissChangeMeetingVisibilityModalIfPresent();
    }

    await this.clickMakePrivate();
    await this.dismissChangeMeetingVisibilityModalIfPresent();
    await this.expectPrivateEventLabelVisible();

    await this.page.keyboard.press("Escape");
    await this.playwrightActionsFactory.waitForSec(0.4);
    await this.clickFirstMeetingThreeDot();
    await this.playwrightActionsFactory.waitForSec(1);
    await this.dismissChangeMeetingVisibilityModalIfPresent();
    await this.clickMakePublic();
    await this.dismissChangeMeetingVisibilityModalIfPresent();
    await this.playwrightActionsFactory.waitForSec(1);
    await this.expectPrivateEventLabelNotVisible();
    await this.playwrightActionsFactory.waitForSec(1);
  }
}
