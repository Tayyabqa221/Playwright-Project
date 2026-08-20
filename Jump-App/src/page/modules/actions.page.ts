import { Page, TestInfo } from "@playwright/test";
import { PlaywrightActionFactory } from "@utilities/playwright.actions.utils";

export class ActionsPage {
  private readonly playwrightActionsFactory: PlaywrightActionFactory;

  constructor(page: Page, _testInfo: TestInfo) {
    this.playwrightActionsFactory = new PlaywrightActionFactory(page, _testInfo);
  }

  async navigateToActions(baseUrl: string): Promise<void> {
    const url = baseUrl.replace(/\/$/, "") + "/actions";
    await this.playwrightActionsFactory.navigateToURL(url);
  }
}
