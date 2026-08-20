import { expect, Page, TestInfo } from "@playwright/test";
import { LocatorInfo } from "@interfaces/locator.info.interface";
import { PlaywrightActionFactory } from "@utilities/playwright.actions.utils";

export class MeetingsPage {
  private readonly page: Page;
  private readonly playwrightActionsFactory: PlaywrightActionFactory;
  private readonly locators: { [key: string]: LocatorInfo };

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.playwrightActionsFactory = new PlaywrightActionFactory(page, testInfo);
    this.locators = {
      meetingsSidebarLink: {
        description: "Meetings link in sidebar",
        locator: page.getByRole("link", { name: "Meetings", exact: true }),
      },
      filterTabAiProcessed: {
        description: "AI-processed filter tab",
        locator: page
          .getByRole("button", { name: /AI-processed|AI processed/i })
          .or(page.getByRole("tab", { name: /AI-processed|AI processed/i }))
          .or(page.locator("[role='tab'], button").filter({ hasText: /AI-processed|AI processed/i }).first()),
      },
      listViewToggle: {
        description: "List view toggle button",
        locator: page
          .locator('[data-test="view-mode-list"]')
          .or(page.getByRole("button", { name: /^List view$/i }))
          .or(page.locator("button").filter({ hasText: /^List view$/i }).first()),
      },
      calendarViewToggle: {
        description: "Calendar view button (data-test=view-mode-calendar)",
        locator: page.locator('[data-test="view-mode-calendar"]'),
      },
      calendarSettingsButton: {
        description: "Calendar settings button on Meetings page",
        locator: page
          .getByRole("button", { name: /calendar settings/i })
          .or(page.getByRole("link", { name: /calendar settings/i }))
          .or(page.locator("div.pc-button, button, a").filter({ hasText: /calendar settings/i }).first()),
      },
      calendarForwardButton: {
        description: "Next week button (forward)",
        locator: page.locator('[data-role="next-week-button"]').or(page.getByRole("button", { name: "Next week" })),
      },
      calendarBackwardButton: {
        description: "Previous week button (backward)",
        locator: page.locator('[data-role="prev-week-button"]').or(page.getByRole("button", { name: "Previous week" })),
      },
      todayButton: {
        description: "Today button in calendar header",
        locator: page
          .getByRole("button", { name: "Week" })
          .locator("..")
          .getByText("Today", { exact: true })
          .first()
          .or(page.getByText("Today", { exact: true }).first()),
      },
      redLineCurrentTime: {
        description: "Red line (current time indicator) on calendar",
        locator: page.locator("[class*='current-time'], [data-testid*='current-time'], [class*='red']").filter({ has: page.locator("div, hr") }).first().or(page.locator("hr[class*='danger'], div[class*='bg-danger']").first()),
      },
      greenMarkerCurrentDay: {
        description: "Green marker (current day indicator) on calendar",
        locator: page.locator("[class*='today'], [data-testid*='today'], [class*='green'], [class*='primary']").first(),
      },
      dayRangeDropdownTrigger: {
        description: "Day range dropdown trigger in calendar (Change date range)",
        locator: page.locator('[data-role="day-range-dropdown-trigger"]').first(),
      },
      tabUpcoming: {
        description: "Upcoming tab in List view",
        locator: page.getByRole("tab", { name: "Upcoming" }).or(page.getByRole("link", { name: "Upcoming" })).first(),
      },
      tabAllPast: {
        description: "All past tab in List view",
        locator: page.getByRole("tab", { name: "All past" }).or(page.getByRole("link", { name: "All past" })).first(),
      },
      tabAiProcessed: {
        description: "AI-processed tab in List view",
        locator: page.getByRole("tab", { name: /AI-Processed|AI processed/i }).or(page.getByRole("link", { name: /AI-Processed|AI processed/i })).first(),
      },
      tabNeedsAction: {
        description: "Needs Action tab in List view",
        locator: page.getByRole("tab", { name: "Needs Action" }).or(page.getByRole("link", { name: "Needs Action" })).first(),
      },
      filterButton: {
        description: "Filter button on Meetings list view",
        locator: page.getByRole("button", { name: "Open options Filter" }).first(),
      },
      filterOptionArchivedMeetings: {
        description: "Archived meetings option in Filter dropdown",
        locator: page.locator("a[href*='archived=true']").filter({ hasText: /archived meetings/i }).first().or(page.getByRole("menuitem", { name: "Archived meetings" }).first()),
      },
      filterOptionMissedMeetings: {
        description: "Missed meetings option in Filter dropdown",
        locator: page.locator("a[href*='missed=true']").filter({ hasText: /missed meetings/i }).first().or(page.getByRole("menuitem", { name: "Missed meetings" }).first()),
      },
      firstMeetingCardThreeDot: {
        description: "3-dot button on first meeting card in list view",
        locator: page
          .locator("a[href*='/meetings/mtg_']")
          .first()
          .locator("..")
          .locator("button")
          .filter({ has: page.locator("svg") })
          .first()
          .or(page.locator("[data-role='meetings-live-outer-result']").locator("button").filter({ has: page.locator("svg") }).first())
          .or(page.locator("[data-test-id='meeting-card']").first().locator("button").filter({ has: page.locator("svg") }).first())
          .or(page.locator("main").locator("button[aria-haspopup='true']").first()),
      },
      removeMenuItem: {
        description: "Remove option in meeting card menu",
        locator: page.getByRole("menuitem", { name: /remove/i }).or(page.locator("[role='menuitem']").filter({ hasText: /^remove$/i }).first()),
      },
      confirmDeleteButton: {
        description: "Yes, delete button in remove confirmation modal",
        locator: page.getByRole("button", { name: /yes,?\s*delete/i }).or(page.locator("button.pc-button--danger.test-class-delete").filter({ hasText: /yes,?\s*delete/i })),
      },
      meetingRemovedToast: {
        description: "Meeting removed toast message",
        locator: page.getByText(/meeting removed\.?/i),
      },
      makePrivateOption: {
        description: "Make private menu option in meeting card menu",
        locator: page.getByRole("menuitem", { name: /make private/i }).or(
          page.locator("[role='menuitem']").filter({ hasText: /^make private$/i }).first()
        ),
      },
      makePublicOption: {
        description: "Make public / remove private option in meeting card overflow menu",
        locator: page
          .getByRole("menuitem", {
            name: /make\s*public|remove\s*private|mark\s*as\s*public|change\s+to\s+public|set\s+as\s+public|turn\s+public|not\s+private/i,
          })
          .or(
            page.locator("[role='menuitem']").filter({
              hasText: /make\s*public|remove\s*private|mark\s*as\s*public|change\s+to\s+public|set\s+as\s+public|turn\s+public|not\s+private/i,
            })
          )
          .or(
            page.getByRole("button", {
              name: /make\s*public|remove\s*private|mark\s*as\s*public|turn\s+public/i,
            })
          )
          .first(),
      },
      privateEventLabelListView: {
        description: "Private Event label on first meeting card in list view",
        locator: page.locator("[data-test-id='meeting-card']").first().getByText(/private event|^private$/i),
      },
      meetingTypeSelectorFirstCard: {
        description: "Meeting Type Selector (dropdown trigger) on first meeting card in list view",
        locator: page
          .locator("[data-test-id='meeting-card']")
          .first()
          .locator("button[id*='meeting_type_'][id$='-trigger']")
          .or(page.locator("[data-test-id='meeting-card']").first().locator("button[data-qa='trigger']").filter({ hasText: /auto-detect meeting type/i })),
      },
      appHomeShell: {
        description: "App home shell ready (New meeting sidebar trigger)",
        locator: page.locator("#new-meeting-menu-trigger"),
      },
      meetingsViewModeReady: {
        description: "Meetings page: List or Calendar view toggle visible",
        locator: page
          .locator('[data-test="view-mode-calendar"]')
          .or(page.locator('[data-test="view-mode-list"]'))
          .first(),
      },
    };
  }

  /**
   * Opens base URL and waits for shell UI. Avoids networkidle (SPA often never idle).
   */
  async navigateToApp(baseUrl: string): Promise<void> {
    const url = baseUrl.replace(/\/$/, "");
    await this.playwrightActionsFactory.navigateToURL(url);
    await this.page.waitForLoadState("domcontentloaded", { timeout: 20000 });
    await this.playwrightActionsFactory.waitForSelector(this.locators.appHomeShell, 20000, "visible");
  }

  async clickMeetingsSidebar(): Promise<void> {
    await this.locators.meetingsSidebarLink.locator.waitFor({ state: "visible", timeout: 15000 });
    await this.playwrightActionsFactory.click(this.locators.meetingsSidebarLink);
    await this.page.waitForURL((url) => url.pathname.includes("/meetings"), { timeout: 15000 });
    await this.page.waitForLoadState("domcontentloaded", { timeout: 15000 });
    await this.playwrightActionsFactory.waitForSelector(this.locators.meetingsViewModeReady, 15000, "visible");
  }

  async clickListViewToggle(): Promise<void> {
    await this.locators.listViewToggle.locator.waitFor({ state: "visible", timeout: 15000 });
    await this.playwrightActionsFactory.click(this.locators.listViewToggle);
    await this.playwrightActionsFactory.waitForSec(2);
  }

  /** Click List view button (for List View tabs flow), then wait 1s. */
  async clickListViewButton(): Promise<void> {
    await this.locators.listViewToggle.locator.waitFor({ state: "visible", timeout: 15000 });
    await this.playwrightActionsFactory.click(this.locators.listViewToggle);
    await this.playwrightActionsFactory.waitForSec(1);
  }

  async clickTabUpcoming(): Promise<void> {
    await this.locators.tabUpcoming.locator.waitFor({ state: "visible", timeout: 10000 });
    await this.playwrightActionsFactory.click(this.locators.tabUpcoming);
  }

  async clickTabAllPast(): Promise<void> {
    await this.locators.tabAllPast.locator.waitFor({ state: "visible", timeout: 10000 });
    await this.playwrightActionsFactory.click(this.locators.tabAllPast);
  }

  async clickTabAiProcessed(): Promise<void> {
    await this.locators.tabAiProcessed.locator.waitFor({ state: "visible", timeout: 10000 });
    await this.playwrightActionsFactory.click(this.locators.tabAiProcessed);
  }

  async clickTabNeedsAction(): Promise<void> {
    await this.locators.tabNeedsAction.locator.waitFor({ state: "visible", timeout: 10000 });
    await this.playwrightActionsFactory.click(this.locators.tabNeedsAction);
  }

  async expectMeetingsUrlFilter(filterValue: string): Promise<void> {
    await this.page.waitForURL((url) => url.searchParams.get("filter") === filterValue, { timeout: 10000 });
    await expect(this.page).toHaveURL(new RegExp(`[?&]filter=${filterValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  }

  async clickFilterButton(): Promise<void> {
    await this.locators.filterButton.locator.waitFor({ state: "visible", timeout: 10000 });
    await this.playwrightActionsFactory.click(this.locators.filterButton);
  }

  async clickFilterOptionArchivedMeetings(): Promise<void> {
    await this.locators.filterOptionArchivedMeetings.locator.waitFor({ state: "visible", timeout: 10000 });
    await this.playwrightActionsFactory.click(this.locators.filterOptionArchivedMeetings);
  }

  async clickFilterOptionMissedMeetings(): Promise<void> {
    await this.locators.filterOptionMissedMeetings.locator.waitFor({ state: "visible", timeout: 10000 });
    await this.playwrightActionsFactory.click(this.locators.filterOptionMissedMeetings);
  }

  async expectMeetingsUrlArchivedTrue(): Promise<void> {
    await this.page.waitForURL((url) => url.searchParams.get("archived") === "true", { timeout: 10000 });
    await expect(this.page).toHaveURL(/[?&]archived=true/);
  }

  async expectMeetingsUrlArchivedFalse(): Promise<void> {
    await this.page.waitForURL((url) => url.searchParams.get("archived") !== "true", { timeout: 10000 });
    await expect(this.page).not.toHaveURL(/[?&]archived=true/);
  }

  async expectMeetingsUrlMissedTrue(): Promise<void> {
    await this.page.waitForURL((url) => url.searchParams.get("missed") === "true", { timeout: 10000 });
    await expect(this.page).toHaveURL(/[?&]missed=true/);
  }

  async expectMeetingsUrlMissedFalse(): Promise<void> {
    await this.page.waitForURL((url) => url.searchParams.get("missed") !== "true", { timeout: 10000 });
    await expect(this.page).not.toHaveURL(/[?&]missed=true/);
  }

  async clickCalendarViewToggle(): Promise<void> {
    await this.locators.calendarViewToggle.locator.waitFor({ state: "visible", timeout: 15000 });
    await this.playwrightActionsFactory.click(this.locators.calendarViewToggle);
    await this.playwrightActionsFactory.waitForSec(1);
  }

  /** Click Calendar view button (data-test=view-mode-calendar), then wait 2 sec for calendar to load. */
  async clickCalendarViewAndWait(): Promise<void> {
    await this.locators.calendarViewToggle.locator.waitFor({ state: "visible", timeout: 15000 });
    await this.playwrightActionsFactory.click(this.locators.calendarViewToggle);
    await this.playwrightActionsFactory.waitForSec(2);
  }

  async expectOnMeetingsPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/meetings/);
  }

  async clickCalendarSettings(): Promise<void> {
    await this.locators.calendarSettingsButton.locator.waitFor({ state: "visible", timeout: 15000 });
    await this.playwrightActionsFactory.click(this.locators.calendarSettingsButton);
  }

  async expectCalendarSettingsPage(): Promise<void> {
    await this.page.waitForURL(
      (url) => url.pathname.includes("/settings/user") && url.href.includes("calendars_section"),
      { timeout: 15000 }
    );
    await expect(this.page).toHaveURL(/calendars_section/);
  }

  /**
   * Calendar settings flow: open home → click Meetings → click Calendar settings → verify settings page.
   */
  async runCalendarSettingsFlow(baseUrl: string): Promise<void> {
    await this.navigateToApp(baseUrl);
    await this.clickMeetingsSidebar();
    await this.expectOnMeetingsPage();
    await this.playwrightActionsFactory.waitForSec(1);
    await this.clickCalendarSettings();
    await this.expectCalendarSettingsPage();
  }

  /**
   * Meetings View Toggle flow: open home → click Meetings → /meetings →
   * click List view → click Calendar view (toggle to list then back to calendar).
   */
  async runMeetingsViewToggleFlow(baseUrl: string): Promise<void> {
    await this.navigateToApp(baseUrl);
    await this.clickMeetingsSidebar();
    await this.expectOnMeetingsPage();

    await this.clickListViewToggle();
    await this.clickCalendarViewToggle();
    await this.expectOnMeetingsPage();
    await this.playwrightActionsFactory.waitForSec(2);
  }

  async clickCalendarForwardButton(): Promise<void> {
    await this.locators.calendarForwardButton.locator.waitFor({ state: "visible", timeout: 10000 });
    await this.playwrightActionsFactory.click(this.locators.calendarForwardButton);
    await this.playwrightActionsFactory.waitForSec(1);
  }

  async clickCalendarBackwardButton(): Promise<void> {
    await this.locators.calendarBackwardButton.locator.waitFor({ state: "visible", timeout: 10000 });
    await this.playwrightActionsFactory.click(this.locators.calendarBackwardButton);
    await this.playwrightActionsFactory.waitForSec(1);
  }

  async clickTodayButton(): Promise<void> {
    await this.locators.todayButton.locator.waitFor({ state: "visible", timeout: 10000 });
    await this.playwrightActionsFactory.click(this.locators.todayButton);
    await this.playwrightActionsFactory.waitForSec(1);
  }

  async expectRedLineAndGreenMarkerVisible(): Promise<void> {
    const currentDayOrTime = this.page.locator(
      "[data-current='true'], [class*='current-time'], [class*='today'], [aria-selected='true'], [class*='bg-danger'], [class*='ring-primary']"
    ).first();
    await currentDayOrTime.waitFor({ state: "visible", timeout: 10000 });
    await expect(currentDayOrTime).toBeVisible();
  }

  async clickDayRangeDropdownTrigger(): Promise<void> {
    await this.locators.dayRangeDropdownTrigger.locator.waitFor({ state: "visible", timeout: 15000 });
    await this.playwrightActionsFactory.click(this.locators.dayRangeDropdownTrigger);
  }

  /** Click an option in the day range dropdown by text (e.g. "3 days", "Week", "Show weekend"). */
  async clickDayRangeOption(optionText: string): Promise<void> {
    const option = this.page
      .getByRole("menuitem", { name: new RegExp(`Show ${optionText}|^${optionText}$`, "i") })
      .or(this.page.getByRole("menuitem").filter({ hasText: new RegExp(optionText, "i") }).first());
    await option.first().waitFor({ state: "visible", timeout: 10000 });
    await option.first().click();
  }

  /**
   * List View tabs flow: Home → Meetings → List view →
   * Upcoming (wait 1s, check URL) → All past (wait 1s, check URL) → AI-processed (wait 1s, check URL) → Needs Action (wait 1s, check URL).
   */
  async runListViewTabsFlow(baseUrl: string): Promise<void> {
    await this.navigateToApp(baseUrl);
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickMeetingsSidebar();
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickListViewButton();

    await this.clickTabUpcoming();
    await this.playwrightActionsFactory.waitForSec(1);
    await this.expectMeetingsUrlFilter("upcoming");

    await this.clickTabAllPast();
    await this.playwrightActionsFactory.waitForSec(1);
    await this.expectMeetingsUrlFilter("all");

    await this.clickTabAiProcessed();
    await this.playwrightActionsFactory.waitForSec(1);
    await this.expectMeetingsUrlFilter("processed_only");

    await this.clickTabNeedsAction();
    await this.playwrightActionsFactory.waitForSec(1);
    await this.expectMeetingsUrlFilter("outstanding");
  }

  /**
   * Filter flow: Home → Meetings → List view → All past (wait 1s, check URL) →
   * Filter → Archived meetings (wait 1s, check URL) → Filter → Archived again (check URL) →
   * Filter → Missed meetings (wait 1s, check URL) → Filter → Missed again (check URL), wait 1s.
   */
  async runFilterFlow(baseUrl: string): Promise<void> {
    await this.navigateToApp(baseUrl);
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickMeetingsSidebar();
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickListViewButton();

    await this.clickTabAllPast();
    await this.playwrightActionsFactory.waitForSec(1);
    await this.expectMeetingsUrlFilter("all");

    await this.clickFilterButton();
    await this.clickFilterOptionArchivedMeetings();
    await this.playwrightActionsFactory.waitForSec(1);
    await this.expectMeetingsUrlArchivedTrue();

    await this.clickFilterButton();
    await this.clickFilterOptionArchivedMeetings();
    await this.expectMeetingsUrlArchivedFalse();
    await this.expectMeetingsUrlFilter("all");

    await this.clickFilterButton();
    await this.clickFilterOptionMissedMeetings();
    await this.playwrightActionsFactory.waitForSec(1);
    await this.expectMeetingsUrlMissedTrue();

    await this.clickFilterButton();
    await this.clickFilterOptionMissedMeetings();
    await this.expectMeetingsUrlMissedFalse();
    await this.expectMeetingsUrlFilter("all");
    await this.playwrightActionsFactory.waitForSec(1);
  }

  /** Returns true if at least one meeting card is visible in list view. */
  async hasMeetingCardInListView(timeoutMs = 15000): Promise<boolean> {
    try {
      const firstCard = this.page.locator("[data-test-id='meeting-card']").first();
      await firstCard.waitFor({ state: "visible", timeout: timeoutMs });
      return true;
    } catch {
      try {
        const firstLink = this.page.locator("a[href*='/meetings/mtg_']").first();
        await firstLink.waitFor({ state: "visible", timeout: 5000 });
        return true;
      } catch {
        return false;
      }
    }
  }

  /** Click 3-dot button on the first (top-most) meeting card in list view. Hovers the card first so the 3-dot is visible. */
  async clickFirstMeetingCardThreeDotInListView(): Promise<void> {
    let firstCard = this.page.locator("[data-test-id='meeting-card']").first();
    const cardCount = await firstCard.count();
    if (cardCount === 0) {
      const firstLink = this.page.locator("a[href*='/meetings/mtg_']").first();
      await firstLink.waitFor({ state: "visible", timeout: 10000 });
      firstCard = firstLink.locator("xpath=ancestor::*[.//button[.//svg]][1]");
      await firstCard.waitFor({ state: "visible", timeout: 5000 });
    } else {
      await firstCard.waitFor({ state: "visible", timeout: 15000 });
    }
    await firstCard.hover();
    await this.playwrightActionsFactory.waitForSec(0.5);
    const threeDot = firstCard.locator("button").filter({ has: this.page.locator("svg") }).first();
    await threeDot.waitFor({ state: "visible", timeout: 10000 });
    await threeDot.click();
  }

  async clickRemoveMenuItem(): Promise<void> {
    await this.locators.removeMenuItem.locator.waitFor({ state: "visible", timeout: 10000 });
    await this.playwrightActionsFactory.click(this.locators.removeMenuItem);
  }

  async clickConfirmDeleteInModal(): Promise<void> {
    await this.locators.confirmDeleteButton.locator.waitFor({ state: "visible", timeout: 10000 });
    await this.playwrightActionsFactory.click(this.locators.confirmDeleteButton);
  }

  async expectMeetingRemovedToast(): Promise<void> {
    await this.locators.meetingRemovedToast.locator.waitFor({ state: "visible", timeout: 15000 });
    await expect(this.locators.meetingRemovedToast.locator).toBeVisible();
  }

  async clickMakePrivateMenuItem(): Promise<void> {
    await this.locators.makePrivateOption.locator.waitFor({ state: "visible", timeout: 10000 });
    await this.playwrightActionsFactory.click(this.locators.makePrivateOption);
  }

  /**
   * Opens the first card overflow menu fresh (Escape avoids toggle-closed bug) and clicks the public action.
   * Dismisses any stray visibility modal before opening the menu so we do not hold the menu open during a long modal poll.
   */
  async clickMakePublicMenuItem(): Promise<void> {
    await this.page.keyboard.press("Escape");
    await this.playwrightActionsFactory.waitForSec(0.5);
    await this.dismissChangeMeetingVisibilityModalIfPresent();
    await this.clickFirstMeetingCardThreeDotInListView();
    await this.playwrightActionsFactory.waitForSec(0.4);

    const publicLabel =
      /make\s*public|remove\s*private|mark\s*as\s*public|change\s+to\s+public|set\s+as\s+public|turn\s+public|not\s+private/i;
    const menuSurface = this.page
      .locator('[role="menu"], [role="listbox"]')
      .filter({ visible: true })
      .last();
    await menuSurface.waitFor({ state: "visible", timeout: 15000 });

    const item = menuSurface
      .getByRole("menuitem", { name: publicLabel })
      .or(menuSurface.locator("[role='menuitem']").filter({ hasText: publicLabel }))
      .or(menuSurface.locator("a, button").filter({ hasText: publicLabel }))
      .first();

    await item.waitFor({ state: "visible", timeout: 25000 });
    await item.click({ timeout: 10000 });
  }

  /**
   * If "Change meeting visibility" modal is open (recurring meeting), wait 1s, click Confirm, wait 1s.
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

  async expectPrivateEventLabelVisibleInListView(): Promise<void> {
    await this.playwrightActionsFactory.waitForSec(2);
    await this.locators.privateEventLabelListView.locator.waitFor({ state: "visible", timeout: 20000 });
    await expect(this.locators.privateEventLabelListView.locator).toBeVisible();
  }

  async expectPrivateEventLabelNotVisibleInListView(): Promise<void> {
    await expect(this.locators.privateEventLabelListView.locator).not.toBeVisible();
  }

  /**
   * Make Private flow: Home → Meetings → List view (wait 1s) → Upcoming tab (wait 1s) →
   * 3-dot on first meeting (wait 1s) → [modal if recurring] → Make Private → [modal] → verify Private label →
   * Make Public (opens 3-dot menu internally) → [modal] → verify label gone.
   * Returns false if no upcoming meetings (caller should skip); true otherwise.
   */
  async runMakePrivateFlow(baseUrl: string): Promise<boolean> {
    await this.navigateToApp(baseUrl);
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickMeetingsSidebar();
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickListViewButton();

    await this.clickTabUpcoming();
    await this.playwrightActionsFactory.waitForSec(1);

    const hasMeeting = await this.hasMeetingCardInListView(5000);
    if (!hasMeeting) {
      return false;
    }

    await this.clickFirstMeetingCardThreeDotInListView();
    await this.playwrightActionsFactory.waitForSec(1);
    await this.dismissChangeMeetingVisibilityModalIfPresent();

    await this.clickMakePrivateMenuItem();
    await this.dismissChangeMeetingVisibilityModalIfPresent();
    await this.expectPrivateEventLabelVisibleInListView();

    await this.clickMakePublicMenuItem();
    await this.dismissChangeMeetingVisibilityModalIfPresent();
    await this.playwrightActionsFactory.waitForSec(1);
    await this.expectPrivateEventLabelNotVisibleInListView();

    return true;
  }

  /**
   * Click Meeting Type Selector (button with id meeting_type_*-trigger or data-qa=trigger) on the first meeting card and select a random meeting type from the dropdown.
   */
  async clickMeetingTypeSelectorAndSelectRandom(): Promise<void> {
    const firstCard = this.page.locator("[data-test-id='meeting-card']").first();
    await firstCard.waitFor({ state: "visible", timeout: 15000 });
    const selectorTrigger = firstCard
      .locator("button[id*='meeting_type_'][id$='-trigger']")
      .or(firstCard.locator("button[data-qa='trigger']").filter({ hasText: /auto-detect meeting type/i }));
    await selectorTrigger.first().waitFor({ state: "visible", timeout: 10000 });
    await selectorTrigger.first().click();
    await this.playwrightActionsFactory.waitForSec(2);
    const listbox = this.page
      .locator("[id*='meeting_type_'][id$='-group'] [role='listbox']")
      .or(this.page.locator("[role='listbox']").first());
    await listbox.first().waitFor({ state: "visible", timeout: 10000 });
    const options = listbox.first().getByRole("option");
    const count = await options.count();
    if (count === 0) {
      throw new Error("Meeting type dropdown has no options");
    }
    const randomIndex = Math.floor(Math.random() * count);
    await options.nth(randomIndex).click();
    await this.playwrightActionsFactory.waitForSec(1);
  }

  /**
   * Meeting Type Selector flow: Home → Meetings → List view (wait 1s) → Upcoming tab (wait 1s) →
   * on first meeting card click Meeting Type Selector → select random meeting type from dropdown.
   * Returns false if no upcoming meetings (caller should skip); true otherwise.
   */
  async runMeetingTypeSelectorFlow(baseUrl: string): Promise<boolean> {
    await this.navigateToApp(baseUrl);
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickMeetingsSidebar();
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickListViewButton();

    await this.clickTabUpcoming();
    await this.playwrightActionsFactory.waitForSec(1);

    const hasMeeting = await this.hasMeetingCardInListView(5000);
    if (!hasMeeting) {
      return false;
    }

    await this.clickMeetingTypeSelectorAndSelectRandom();
    await this.playwrightActionsFactory.waitForSec(2);
    return true;
  }

  /**
   * Remove flow: Home → Meetings → List view (wait 1s) → Upcoming tab (wait 1s) →
   * 3-dot on first meeting (wait 1s) → Remove → Yes, delete → wait for Meeting removed toast.
   * Returns false if no upcoming meetings (caller should skip); true otherwise.
   */
  async runRemoveFlow(baseUrl: string): Promise<boolean> {
    await this.navigateToApp(baseUrl);
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickMeetingsSidebar();
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickListViewButton();

    await this.clickTabUpcoming();
    await this.playwrightActionsFactory.waitForSec(1);

    const hasMeeting = await this.hasMeetingCardInListView(5000);
    if (!hasMeeting) {
      return false;
    }

    await this.clickFirstMeetingCardThreeDotInListView();
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickRemoveMenuItem();

    await this.playwrightActionsFactory.waitForSec(1);
    await this.clickConfirmDeleteInModal();
    await this.playwrightActionsFactory.waitForSec(1);

    await this.expectMeetingRemovedToast();
    return true;
  }

  /**
   * Day Range Selector flow: Home → Meetings → Calendar view →
   * open day range → 3 days (wait 2s) → open → Week (wait 2s) → open → Show weekend (wait 2s) → wait 2s end.
   */
  async runDayRangeSelectorFlow(baseUrl: string): Promise<void> {
    await this.navigateToApp(baseUrl);
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickMeetingsSidebar();
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickCalendarViewAndWait();

    await this.clickDayRangeDropdownTrigger();
    await this.clickDayRangeOption("3 days");
    await this.playwrightActionsFactory.waitForSec(2);

    await this.clickDayRangeDropdownTrigger();
    await this.clickDayRangeOption("Week");
    await this.playwrightActionsFactory.waitForSec(2);

    await this.clickDayRangeDropdownTrigger();
    await this.clickDayRangeOption("Show weekend");
    await this.playwrightActionsFactory.waitForSec(2);

    await this.clickDayRangeDropdownTrigger();
    await this.clickDayRangeOption("Show weekend");
    await this.playwrightActionsFactory.waitForSec(2);
  }

  /**
   * Horizontal Navigation flow: Home → Meetings → click Calendar view → wait 2s →
   * click Next week (forward) → wait 1s → click Today → wait 1s → check indicator visible →
   * click backward → wait 1s → click Today → check indicator visible → wait 1s → end.
   */
  async runHorizontalNavigationFlow(baseUrl: string): Promise<void> {
    await this.navigateToApp(baseUrl);
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickMeetingsSidebar();
    await this.playwrightActionsFactory.waitForSec(1);

    await this.clickCalendarViewAndWait();

    await this.clickCalendarForwardButton();

    await this.clickTodayButton();
    await this.playwrightActionsFactory.waitForSec(1);
    await this.expectRedLineAndGreenMarkerVisible();

    await this.clickCalendarBackwardButton();

    await this.clickTodayButton();
    await this.expectRedLineAndGreenMarkerVisible();
    await this.playwrightActionsFactory.waitForSec(1);
  }
}
