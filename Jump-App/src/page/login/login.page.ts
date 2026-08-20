import { Page, TestInfo } from "@playwright/test";
import { LocatorInfo } from "@interfaces/locator.info.interface";
import { PlaywrightActionFactory } from "@utilities/playwright.actions.utils";
import { getTotpCode } from "@utilities/totp.utils";

export class LoginPage {
  private readonly page: Page;
  private readonly testInfo: TestInfo;
  private readonly playwrightActionsFactory: PlaywrightActionFactory;
  private readonly locators: { [key: string]: LocatorInfo };

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
    this.playwrightActionsFactory = new PlaywrightActionFactory(page, testInfo);
    this.locators = {
      googleLoginBtn: {
        description: "Continue with Google / Sign in with Google",
        locator: page
          .getByRole("button", { name: /continue with google|sign in with google/i })
          .or(page.getByRole("link", { name: /continue with google|sign in with google/i })),
      },
      googleEmailInput: {
        description: "Google email or phone input",
        locator: page.getByRole("textbox", { name: /email or phone/i }),
      },
      googleNextBtn: {
        description: "Google Next button",
        locator: page.getByRole("button", { name: "Next" }),
      },
      googlePasswordInput: {
        description: "Google password input",
        locator: page.getByRole("textbox", { name: /enter your password|password/i }),
      },
      twoFactorInput: {
        description: "Google Authenticator code input (totpPin)",
        locator: page
          .locator('input#totpPin, input[name="totpPin"]')
          .or(page.getByRole("textbox", { name: /^enter code$/i }))
          .or(page.getByLabel(/^enter code$/i)),
      },
      twoFactorSubmit: {
        description: "Submit Google Authenticator code (Next)",
        locator: page
          .locator("#totpNext button")
          .or(page.locator('button[jsname="Njthtb"]'))
          .or(page.getByRole("button", { name: /^next$/i })),
      },
      consentContinueBtn: {
        description: "Continue on signing back in screen",
        locator: page.getByRole("button", { name: "Continue", exact: true }),
      },
      googleConsentAllowBtn: {
        description: "Google consent Allow button (exact - not Cancel)",
        locator: page.getByRole("button", { name: "Allow", exact: true }),
      },
      tryAnotherWayBtn: {
        description: "Google 2FA Try another way button",
        locator: page
          .locator('button[jsname="eBSUOb"]')
          .or(page.getByRole("button", { name: /try another way/i }))
          .or(page.getByText(/^try another way$/i)),
      },
      authenticatorAppOption: {
        description: "Google Authenticator app option on challenge selection screen",
        locator: page
          .locator('[data-challengetype="6"]')
          .or(page.getByText(/get a verification code from the google authenticator app/i))
          .or(
            page.getByRole("button", {
              name: /authenticator app|google authenticator|verification code from.*authenticator/i,
            })
          )
          .or(
            page.getByRole("link", {
              name: /authenticator app|google authenticator|verification code from.*authenticator/i,
            })
          ),
      },
    };
  }

  async navigateToLoginPage(baseUrl: string): Promise<void> {
    await this.playwrightActionsFactory.navigateToURL(`${baseUrl}`);
  }

  /**
   * Logs in with Google. When `twoFactorSecret` is set, a fresh TOTP code is generated
   * from the authenticator secret when the Google code screen appears.
   */
  async loginWithGoogle(
    email: string,
    password: string,
    twoFactorSecret?: string,
    baseUrl?: string
  ): Promise<void> {
    await this.playwrightActionsFactory.click(this.locators.googleLoginBtn);
    await this.playwrightActionsFactory.sendKeys(this.locators.googleEmailInput, email);
    await this.playwrightActionsFactory.click(this.locators.googleNextBtn);
    await this.playwrightActionsFactory.sendKeys(this.locators.googlePasswordInput, password, true);
    await this.playwrightActionsFactory.click(this.locators.googleNextBtn);

    await this.completeGoogleSignIn(twoFactorSecret, baseUrl);
  }

  /** Handles Google 2FA, OAuth consent, until the app home URL is reached. */
  private async completeGoogleSignIn(twoFactorSecret?: string, baseUrl?: string): Promise<void> {
    const deadline = Date.now() + 120_000;

    while (Date.now() < deadline) {
      if (this.page.isClosed()) {
        throw new Error("Browser page closed during Google sign-in");
      }

      if (this.isOnAppHome(baseUrl)) {
        return;
      }

      if (twoFactorSecret) {
        if (this.isOnTotpChallengePage() && (await this.tryFillTwoFactorFromAuthenticator(twoFactorSecret))) {
          await this.waitBriefly(2500);
          continue;
        }

        if (this.isOnChallengeSelectionPage() && (await this.tryClickVisible(this.locators.authenticatorAppOption, 3000))) {
          await this.waitBriefly(2000);
          continue;
        }

        if (
          !this.isOnTotpChallengePage() &&
          !this.isOnChallengeSelectionPage() &&
          (await this.tryClickVisible(this.locators.tryAnotherWayBtn, 2000))
        ) {
          await this.waitBriefly(1500);
          continue;
        }
      }

      if (await this.tryClickVisible(this.locators.consentContinueBtn, 1500)) {
        await this.waitBriefly(1500);
        continue;
      }

      if (await this.tryClickVisible(this.locators.googleConsentAllowBtn, 1500)) {
        await this.waitBriefly(2000);
        continue;
      }

      await this.waitBriefly(500);
    }

    if (baseUrl && !this.isOnAppHome(baseUrl)) {
      throw new Error(
        `Google sign-in did not complete. Current URL: ${this.page.url()}. Check JUMPAPP_2FA_SECRET and authenticator setup.`
      );
    }
  }

  /** Fills #totpPin with a fresh authenticator code and clicks Next. */
  private async tryFillTwoFactorFromAuthenticator(twoFactorSecret: string): Promise<boolean> {
    const input = this.locators.twoFactorInput.locator.first();
    const isVisible = await input
      .waitFor({ state: "visible", timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    if (!isVisible) {
      return false;
    }

    const tooManyAttempts = await this.page
      .getByText(/too many failed attempts/i)
      .isVisible()
      .catch(() => false);
    if (tooManyAttempts) {
      throw new Error(
        "Google blocked 2FA: too many failed attempts. Wait a few minutes, then re-run auth setup."
      );
    }

    const code = getTotpCode(twoFactorSecret);
    await this.testInfo.attach("2FA code generated from authenticator", {
      body: "Fresh TOTP code generated from JUMPAPP_2FA_SECRET and entered on Google totpPin screen",
      contentType: "text/plain",
    });

    await input.click();
    await input.fill("");
    await input.pressSequentially(code, { delay: 80 });
    await this.waitBriefly(300);

    const submit = this.locators.twoFactorSubmit.locator.first();
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
    } else {
      await this.page.keyboard.press("Enter");
    }

    return true;
  }

  private isOnTotpChallengePage(): boolean {
    return /\/signin\/challenge\/totp/i.test(this.page.url());
  }

  private isOnChallengeSelectionPage(): boolean {
    return /\/signin\/challenge\/selection/i.test(this.page.url());
  }

  private async tryClickVisible(locatorInfo: LocatorInfo, timeoutMs: number): Promise<boolean> {
    const button = locatorInfo.locator.first();
    const isVisible = await button
      .waitFor({ state: "visible", timeout: timeoutMs })
      .then(() => true)
      .catch(() => false);

    if (!isVisible) {
      return false;
    }

    await button.click();
    return true;
  }

  private async waitBriefly(ms: number): Promise<void> {
    if (this.page.isClosed()) {
      throw new Error("Browser page closed during Google sign-in");
    }
    await this.page.waitForTimeout(ms);
  }

  private isOnAppHome(baseUrl?: string): boolean {
    if (!baseUrl) {
      return false;
    }
    const appOrigin = baseUrl.replace(/\/$/, "").toLowerCase();
    const current = this.page.url().toLowerCase();
    return current.startsWith(appOrigin) && !current.includes("/login");
  }

  async waitForAppHome(baseUrl: string): Promise<void> {
    const appOrigin = baseUrl.replace(/\/$/, "").toLowerCase();
    await this.page.waitForURL(
      (url) => {
        const u = url.href.toLowerCase();
        return u.startsWith(appOrigin) && !u.includes("/login");
      },
      { timeout: 60000 }
    );
    await this.page.waitForLoadState("domcontentloaded");
  }

  async waitForAuthenticatedUI(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
    const authenticatedIndicator = this.page
      .getByRole("button", { name: /create new|new meeting|open options/i })
      .or(this.page.locator('[aria-label*="New meeting" i], [aria-label*="Create" i]'))
      .or(this.page.locator("#new-meeting-menu-trigger"))
      .first();
    await authenticatedIndicator.waitFor({ state: "visible", timeout: 60000 });
  }

  async storeBrowserStorageState(path: string): Promise<void> {
    await this.page.context().storageState({ path });
    await this.testInfo.attach("Auth state saved", {
      body: `Storage state saved to ${path}`,
      contentType: "text/plain",
    });
  }
}
