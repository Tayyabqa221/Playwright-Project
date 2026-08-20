import { LocatorInfo } from "@interfaces/locator.info.interface";
import { expect, Page, test, TestInfo } from "@playwright/test";
import { WaitTimes } from "@utilities/playwright.actions.utils";
import fs from "fs";
import PdfParse from "pdf-parse";

export class PlaywrightVerificationFactory {
  private readonly page: Page;
  private readonly testInfo: TestInfo;

  /**
   * @param pagepublic async waitForURL(regex: RegExp, timeout: number = 30000): Promise<void> {
   * @param testInfo
   */
  public constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
  }

  public async verifyTitle(expectedTitle: string): Promise<void> {
    await test.step(`🧪 Verifying page title: ${expectedTitle}`, async (): Promise<void> => {
      const actualTitle = await this.page.title();
      const message = `Expected Title: ${expectedTitle} and Actual Title: ${actualTitle}`;
      await this.testInfo.attach(`🧪 ${message}`, {
        body: message,
        contentType: "text/plain",
      });
      expect(actualTitle, message).toBe(expectedTitle);
    });
  }

  public async waitForDomLoad(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
  }

  public async waitForSec(seconds: number): Promise<void> {
    await test.step(`⏳ Waiting for ${seconds} second(s)`, async (): Promise<void> => {
      await this.page.waitForTimeout(seconds * 1000); // Convert seconds to milliseconds
      await this.testInfo.attach(`⏳ Waited for ${seconds} second(s)`, {
        body: `Waited for ${seconds} second(s)`,
        contentType: "text/plain",
      });
    });
  }

  public async waitForSelector(
    locatorInfo: LocatorInfo,
    timeout: number = 30000
  ): Promise<void> {
    await test.step(`⏳ Waiting for "${locatorInfo.description}" to be visible`, async (): Promise<void> => {
      // We log "visible" so we should actually wait for visible (not merely attached).
      await locatorInfo.locator.waitFor({ state: "visible", timeout });
      await this.testInfo.attach(`⏳ "${locatorInfo.description}" is visible`, {
        body: `⏳ "${locatorInfo.description}" is visible`,
        contentType: "text/plain",
      });
    });
  }

  public async verifyUrlContains(expectedUrl: string): Promise<void> {
    const actualUrl = await this.page.url();
    await test.step(`🧪 Verifying if "${actualUrl}" contains "${expectedUrl}"`, async (): Promise<void> => {
      if (actualUrl.includes(expectedUrl)) {
        await this.testInfo.attach(`✅ "${actualUrl}" contains "${expectedUrl}"`, {
          body: `✅ "${actualUrl}" contains "${expectedUrl}"`,
          contentType: "text/plain",
        });
      } else {
        await this.testInfo.attach(`💥 "${actualUrl}" does not contain "${expectedUrl}"`, {
          body: `💥 "${actualUrl}" does not contain "${expectedUrl}"`,
          contentType: "text/plain",
        });
      }
    });
  }

  public async verifyUrlsAreEqual(expectedUrl: string): Promise<void> {
    const actualUrl = await this.page.url();
    await test.step(`🧪 Verifying if "${actualUrl}" is equal to "${expectedUrl}"`, async (): Promise<void> => {
      if (actualUrl === expectedUrl) {
        await this.testInfo.attach(`✅ "${actualUrl}" is equal to "${expectedUrl}"`, {
          body: `✅ "${actualUrl}" is equal to "${expectedUrl}"`,
          contentType: "text/plain",
        });
      }
      else {
        await this.testInfo.attach(`💥 "${actualUrl}" is not equal to "${expectedUrl}"`, {
          body: `💥 "${actualUrl}" is not equal to "${expectedUrl}"`,
          contentType: "text/plain",
        });
      }
      await expect(actualUrl).toStrictEqual(expectedUrl);
    });
  }

  public async waitForElementToDisappear(
    element: LocatorInfo,
    timeout: number = 30000
  ): Promise<void> {
    await test.step(`⏳ Waiting for the ${element.description} to disappear`, async (): Promise<void> => {
      // Wait for the  element to either become hidden or be removed from the DOM
      await element.locator.waitFor({ state: "detached", timeout });

      await this.testInfo.attach('✅ Loader "Just a moment" has disappeared', {
        body: '✅ Loader "Just a moment" has disappeared',
        contentType: "text/plain",
      });
    });
  }

  public async expectElementNotToBeVisible(
    locatorInfo: LocatorInfo,
    timeout: number = 10000
  ): Promise<void> {
    await test.step(`⏳ Waiting for the ${locatorInfo.description} to disappear`, async (): Promise<void> => {
      await locatorInfo.locator.waitFor({ state: "hidden", timeout });
    });
    await this.testInfo.attach(`✅ ${locatorInfo.description} has disappeared`, {
      body: `✅ ${locatorInfo.description} has disappeared`,
      contentType: "text/plain",
    });
    // hard assertion to fail the test if the element is not hidden
    await expect(locatorInfo.locator).not.toBeVisible();
  }

  public async verifyLocatorsCount(
    locatorInfo: LocatorInfo,
    count: number
  ): Promise<void> {
    await test.step(`⏳ Verifying if ${locatorInfo.description} contains ${count} visible suggestions`, async (): Promise<void> => {
      await locatorInfo.locator.first().scrollIntoViewIfNeeded();

      const elements = await locatorInfo.locator.all();
      let visibleCount = 0;
      for (const element of elements) {
        if (await element.isVisible()) {
          visibleCount++;
        }
      }
      if (visibleCount >= count) {
        await this.testInfo.attach(
          `✅ ${locatorInfo.description} has at least ${count} visible elements`,
          {
            body: `✅ ${locatorInfo.description} has ${visibleCount} visible suggestions which is greater than or equal to ${count}.`,
            contentType: "text/plain",
          }
        );
      } else {
        throw new Error(
          `${locatorInfo.description} does not have enough visible suggestions. Expected at least ${count}, but found ${visibleCount}`
        );
      }
    });
  }

  public async verifyValue(
    locatorInfo: LocatorInfo,
    expectedValue: string
  ): Promise<void> {
    await test.step(`🧪 Verifying if "${locatorInfo.description}" value is displayed as expected`, async (): Promise<void> => {
      const actualValue: string = await locatorInfo.locator.inputValue();
      if (actualValue === expectedValue) {
        await this.embedFullPageScreenshot(
          `✅ "${locatorInfo.description}" value is displayed as Expected = "${expectedValue}" ; Actual = "${actualValue}" - Screenshot`
        );
        await this.testInfo.attach(
          `✅ "${locatorInfo.description}" value is displayed as Expected = "${expectedValue}" ; Actual = "${actualValue}"`,
          {
            body: `✅ "${locatorInfo.description}" value is displayed as expected = "${expectedValue}" ; actual = "${actualValue}"`,
            contentType: "text/plain",
          }
        );
      } else {
        await this.embedFullPageScreenshot(
          `💥 "${locatorInfo.description}" value is NOT displayed. Expected = "${expectedValue}" ; Actual = "${actualValue}" - Screenshot`
        );
        await this.testInfo.attach(
          `💥 "${locatorInfo.description}" value is NOT displayed. Expected = "${expectedValue}" ; Actual = "${actualValue}"`,
          {
            body: `💥 "${locatorInfo.description}" value is NOT displayed as expected = "${expectedValue}" ; actual = "${actualValue}"`,
            contentType: "text/plain",
          }
        );
      }
      await expect.soft(locatorInfo.locator).toHaveValue(expectedValue);
    });
  }

  public async verifyText(
    locatorInfo: LocatorInfo,
    strExpectedText: string,
    mask: boolean = false
  ): Promise<void> {
    const displayedText = mask
      ? this.maskValue(strExpectedText)
      : strExpectedText;

    await test.step(`🧪 Verifying if "${locatorInfo.description}" text is displayed as expected`, async (): Promise<void> => {
      const actualText: null | string = await this.getText(locatorInfo);

      if (actualText?.includes(strExpectedText)) {
        await this.embedFullPageScreenshot(
          `✅ "${locatorInfo.description}" text is displayed as Expected = "${displayedText}" ; Actual = "${actualText}" - Screenshot`
        );
        await this.testInfo.attach(
          `✅ "${locatorInfo.description}" text is displayed as Expected = "${displayedText}" ; Actual = "${actualText}"`,
          {
            body: `✅ "${locatorInfo.description}" text is displayed as expected = "${displayedText}" ; actual = "${actualText}"`,
            contentType: "text/plain",
          }
        );
      } else {
        await this.embedFullPageScreenshot(
          `💥 "${locatorInfo.description}" text is NOT displayed as Expected = "${displayedText}" ; Actual = "${actualText}" - Screenshot`
        );
        await this.testInfo.attach(
          `💥 "${locatorInfo.description}" text is NOT displayed as Expected = "${displayedText}" ; Actual = "${actualText}"`,
          {
            body: `💥 "${locatorInfo.description}" text is NOT displayed as expected = "${displayedText}" ; actual = "${actualText}"`,
            contentType: "text/plain",
          }
        );
      }

      await expect.soft(locatorInfo.locator).toContainText(strExpectedText);
    });
  }

  public async verifyPdfContent(
    pdfLinkLocator: LocatorInfo,
    expectedText: string
  ): Promise<void> {
    const pdfUrl = await pdfLinkLocator.locator.getAttribute("href");

    if (!pdfUrl) {
      throw new Error("Failed to get the PDF URL from the link.");
    }

    if (!fs.existsSync("./downloads")) {
      fs.mkdirSync("./downloads");
    }

    const response = await this.page.request.get(pdfUrl!);
    const filePath = "./downloads/temp.pdf";
    fs.writeFileSync(filePath, await response.body());

    const pdfData = await PdfParse(fs.readFileSync(filePath));

    const normalizeText = (text: string): string =>
      text
        .replace(/\s+/g, " ")
        .replace(/[^\w\s:/]/g, "")
        .trim();

    const actualText = normalizeText(pdfData.text);
    const normalizedExpectedText = normalizeText(expectedText);

    await test.step("🧪 Verifying PDF content", async (): Promise<void> => {
      try {
        await expect(actualText).toContain(normalizedExpectedText);
      } finally {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });
  }

  public async waitForVisibility(
    locatorInfo: LocatorInfo,
    timeout: number = 30000
  ): Promise<void> {
    await test.step(`⏳ Waiting for "${locatorInfo.description}" to be visible`, async (): Promise<void> => {
      await locatorInfo.locator.waitFor({ state: "visible", timeout });
      await this.testInfo.attach(`⏳ "${locatorInfo.description}" is visible`, {
        body: `⏳ "${locatorInfo.description}" is visible`,
        contentType: "text/plain",
      });
    });
  }

  public async expectElementExist(locatorInfo: LocatorInfo): Promise<void> {
    await test.step(`🧪 Verifying if "${locatorInfo.description}" exists`, async (): Promise<void> => {
      const isVisible = await locatorInfo.locator.isVisible();
      if (isVisible) {
        await this.embedFullPageScreenshot(
          `✅ "${locatorInfo.description}" exists and is visible - Screenshot`
        );
        await this.testInfo.attach(
          `✅ "${locatorInfo.description}" exists and is visible`,
          {
            body: `✅ "${locatorInfo.description}" exists and is visible`,
            contentType: "text/plain",
          }
        );
      } else {
        await this.embedFullPageScreenshot(
          `💥 "${locatorInfo.description}" does NOT exist or is not visible - Screenshot`
        );
        await this.testInfo.attach(
          `💥 "${locatorInfo.description}" does NOT exist or is not visible`,
          {
            body: `💥 "${locatorInfo.description}" does NOT exist or is not visible`,
            contentType: "text/plain",
          }
        );
      }
      await expect(locatorInfo.locator).toBeVisible();
    });
  }

  public async verifyNotExist(locatorInfo: LocatorInfo): Promise<void> {
    await test.step(`🧪 Verifying if "${locatorInfo.description}" does NOT exist`, async (): Promise<void> => {
      const isVisible = await locatorInfo.locator.isVisible();
      if (isVisible) {
        await this.embedFullPageScreenshot(
          `💥 "${locatorInfo.description}" exists when it should NOT - Screenshot`
        );
        await this.testInfo.attach(
          `💥 "${locatorInfo.description}" exists when it should NOT`,
          {
            body: `💥 "${locatorInfo.description}" exists when it should NOT`,
            contentType: "text/plain",
          }
        );

        // Fail the test if the element is visible
        throw new Error(
          `❌ "${locatorInfo.description}" was found but it should NOT exist.`
        );
      } else {
        await this.embedFullPageScreenshot(
          `✅ "${locatorInfo.description}" does NOT exist - Screenshot`
        );
        await this.testInfo.attach(
          `✅ "${locatorInfo.description}" does NOT exist`,
          {
            body: `✅ "${locatorInfo.description}" does NOT exist`,
            contentType: "text/plain",
          }
        );
      }

      await expect(locatorInfo.locator).toBeHidden();
    });
  }

  public async verifyContains(
    haystack: string,
    needle: string,
    message?: string
  ): Promise<void> {
    const isContained = haystack.includes(needle);

    await test.step(`🧪 Verifying if actual : "${haystack}" contains the expected : "${needle}"`, async () => {
      await this.testInfo.attach(
        isContained
          ? `✅ "${haystack}" contains the expected substring: "${needle}"`
          : `💥 "${haystack}" does NOT contain the expected substring: "${needle}"`,
        {
          body: message || `Expected "${needle}" to be found in "${haystack}"`,
          contentType: "text/plain",
        }
      );

      expect(
        isContained,
        message || `Expected "${needle}" to be found in "${haystack}"`
      ).toBeTruthy();
    });
  }

  public async assertAreEqual(
    expected: number | number[] | string | string[],
    actual: number | number[] | string | string[],
    message?: string
  ): Promise<void> {
    await test.step(`🧪 Verifying if "${expected}" equals "${actual}"`, async (): Promise<void> => {
      try {
        await expect(actual, message).toEqual(expected);

        // ✅ Log success and attach screenshot
        await this.embedFullPageScreenshot("✅ Assertion passed - Screenshot");
        await this.testInfo.attach("✅ Assertion Passed", {
          body: `✅ Expected: "${expected}"\n✅ Actual: "${actual}"`,
          contentType: "text/plain",
        });
      } catch (error) {
        const errorMessage = `💥 Assertion failed: Expected "${expected}", but got "${actual}"`;

        // 💥 Capture a screenshot and attach the failure message
        await this.embedFullPageScreenshot("💥 Assertion failed - Screenshot");
        await this.testInfo.attach("💥 Assertion Failed", {
          body: errorMessage,
          contentType: "text/plain",
        });

        // Re-throw error to ensure the test fails
        throw new Error(errorMessage);
      }
    });
  }

  public async assertAreNotEqual(
    expected: number | number[] | string | string[],
    actual: number | number[] | string | string[],
    message?: string
  ): Promise<void> {
    await test.step(`🧪 Verifying if "${expected}" does not equal "${actual}"`, async (): Promise<void> => {
      try {
        await expect(actual, message).not.toEqual(expected);

        // ✅ Log success and attach screenshot
        await this.embedFullPageScreenshot("✅ Assertion passed - Screenshot");
        await this.testInfo.attach("✅ Assertion Passed", {
          body: `✅ Expected: "${expected}" not to equal "${actual}"`,
          contentType: "text/plain",
        });
      } catch (error) {
        const errorMessage = `💥 Assertion failed: Expected "${expected}" not to equal "${actual}"`;

        // 💥 Capture a screenshot and attach the failure message
        await this.embedFullPageScreenshot("💥 Assertion failed - Screenshot");
        await this.testInfo.attach("💥 Assertion Failed", {
          body: errorMessage,
          contentType: "text/plain",
        });

        // Re-throw error to ensure the test fails
        throw new Error(errorMessage);
      }
    });
  }

  public async assertAreTrue(actual: boolean, message?: string): Promise<void> {
    await test.step('🧪 Verifying if given value is true."', async (): Promise<void> => {
      expect(actual, message).toBeTruthy();
    });
  }

  //Retries the callback until all assertions within it pass or the timeout value is reached.
  public async expectToPass(
    assertion: () => Promise<void>,
    timeOut?: number
  ): Promise<void> {
    await expect(async () => {
      await assertion();
    }).toPass(timeOut ? { timeout: timeOut } : {});
  }

  public async verifyRadioButtonIsChecked(
    locatorInfo: LocatorInfo
  ): Promise<void> {
    await test.step(`🐾 Verifying that the radio button: "${locatorInfo.description}" is checked/selected`, async (): Promise<void> => {
      try {
        // Wait for the element to be attached to the DOM and visible
        if (!(await locatorInfo.locator.isVisible())) {
          await locatorInfo.locator.waitFor({
            state: "attached",
            timeout: WaitTimes.SHORT,
          });
        }

        // Check if the radio button is checked
        await locatorInfo.locator.focus();
        const isChecked = await locatorInfo.locator.isChecked();

        // Attach the result of the check to the test report
        await this.testInfo.attach(
          `🐾 Radio Button "${locatorInfo.description}" Checked Status`,
          {
            body: `Radio Button "${locatorInfo.description}" is checked: ${isChecked}`,
            contentType: "text/plain",
          }
        );
        // Assert the radio button is checked, if needed
        if (!isChecked) {
          throw new Error(
            `Radio button "${locatorInfo.description}" is not checked.`
          );
        }
      } catch (error) {
        // Error handling with meaningful message
        throw new Error(
          `Error while verifying the radio button "${locatorInfo.description}": ${error.message}`
        );
      }
    });
  }

  public async assertElementIsEnabled(
    locatorInfo: LocatorInfo,
    message?: string
  ): Promise<void> {
    await test.step(`🧪 Verifying if "${locatorInfo.description} is enabled." `, async (): Promise<void> => {
      await expect(locatorInfo.locator, message).toBeEnabled();
    });
  }

  public async assertElementIsDisabled(
    locatorInfo: LocatorInfo,
    message?: string
  ): Promise<void> {
    await test.step(`🧪 Verifying if "${locatorInfo.description} is disabled." `, async (): Promise<void> => {
      await expect(locatorInfo.locator, message).toBeDisabled();
    });
  }

  public async ExpectDelegateToPass(
    delegate: () => Promise<void>,
    stepMessage: string = "",
    errorMessage: string = "",
    options: { intervals?: number[]; timeout?: number } = {}
  ): Promise<void> {
    stepMessage = stepMessage === "" ? "Verify delegate passes." : stepMessage;
    const { intervals, timeout } = options;

    try {
      await expect(async () => {
        await delegate();
      }, stepMessage).toPass({
        intervals: intervals || undefined,
        timeout: timeout !== undefined ? timeout : WaitTimes.MEDIUM,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("Timeout")) {
        throw new Error(`${errorMessage} and error: ${error.message}`);
      } else {
        throw error;
      }
    }
  }

  public async assertGreaterThanOrEqualTo(
    expected: number,
    actual: number,
    message?: string
  ): Promise<void> {
    await test.step(`🧪 Verifying if "${expected}" is greater than or equal to "${actual}"`, async (): Promise<void> => {
      await expect(actual, message).toBeGreaterThanOrEqual(expected);
    });
  }

  public async assertStringsEqual(
    actual: string,
    expected: string,
    message?: string
  ): Promise<void> {
    await test.step(`🧪 Verifying if "${actual}" matches expected string "${expected}"`, async (): Promise<void> => {
      await expect(actual, message).toContain(expected);
    });
  }

  public async assertGreaterThan(
    expected: number,
    actual: number,
    message?: string
  ): Promise<void> {
    await test.step(`🧪 Verifying if "${expected}" is greater than"${actual}"`, async (): Promise<void> => {
      await expect(expected, message).toBeGreaterThan(actual);
    });
  }

  public async assertElementHasClass(
    locatorInfo: LocatorInfo,
    className: ReadonlyArray<RegExp | string> | RegExp | string,
    message?: string
  ): Promise<void> {
    await test.step(`🧪 Verifying if "${locatorInfo.description} has class: ${className} present on it." `, async (): Promise<void> => {
      await expect(locatorInfo.locator, message).toHaveClass(className);
    });
  }

  public async assertElementHasAttribute(
    locatorInfo: LocatorInfo,
    attribute: string,
    value: string,
    message?: string
  ): Promise<void> {
    await test.step(`🧪 Verifying if "${locatorInfo.description} has attribute: ${attribute} with value: ${value} present on it." `, async (): Promise<void> => {
      await expect(locatorInfo.locator, message).toHaveAttribute(attribute, value);
    });
  }

  public async assertElementHasCss(
    locatorInfo: LocatorInfo,
    cssProperty: string,
    value: string,
    message?: string
  ): Promise<void> {
    await test.step(`🧪 Verifying if "${locatorInfo.description} has ${cssProperty}: ${value} present on it." `, async (): Promise<void> => {
      await expect(locatorInfo.locator, message).toHaveCSS(cssProperty, value);
    });
  }

  public async assertElementTextContains(
    locatorInfo: LocatorInfo,
    expectedText: string
  ): Promise<void> {
    await test.step(`Verifying : ${locatorInfo.description} field is  displaying expected text `, async (): Promise<void> => {
      // Assert that the text matches
      try {
        await expect(locatorInfo.locator).toHaveText(expectedText.trim());
        await this.testInfo.attach(
          `✅ Text assertion passed for "${locatorInfo.description}"`,
          {
            body: `✅ "${locatorInfo.description}" contains the expected text: "${expectedText}"`,
            contentType: "text/plain",
          }
        );
      } catch (error) {
        // Capture a screenshot and attach the failure message
        await this.embedFullPageScreenshot(
          `💥 Text assertion failed for "${locatorInfo.description}" - Screenshot`
        );
        await this.testInfo.attach(
          `💥 Text assertion failed for "${locatorInfo.description}"`,
          {
            body: `💥 "${locatorInfo.description}" did not contain the expected text: "${expectedText}"`,
            contentType: "text/plain",
          }
        );
        throw error; // Re-throw the error to fail the test
      }
    });
  }

  public async assertElementValueContains(
    locatorInfo: LocatorInfo,
    expectedText: string
  ): Promise<void> {
    await test.step(`Verifying : ${locatorInfo.description} field is  having expected Value `, async (): Promise<void> => {
      // Assert that the text matches
      try {
        await expect(locatorInfo.locator).toHaveValue(expectedText);
        await this.testInfo.attach(
          `✅ Text assertion passed for "${locatorInfo.description}"`,
          {
            body: `✅ "${locatorInfo.description}" contains the expected value: "${expectedText}"`,
            contentType: "text/plain",
          }
        );
      } catch (error) {
        // Capture a screenshot and attach the failure message
        await this.embedFullPageScreenshot(
          `💥 Text assertion failed for "${locatorInfo.description}" - Screenshot`
        );
        await this.testInfo.attach(
          `💥 Text assertion failed for "${locatorInfo.description}"`,
          {
            body: `💥 "${locatorInfo.description}" did not contain the expected value: "${expectedText}"`,
            contentType: "text/plain",
          }
        );
        //throw error; // Re-throw the error to fail the test
      }
    });
  }

  public async embedFullPageScreenshot(description: string): Promise<void> {
    await test.step(
      `📸 "${description} - Full page screenshot`.trim(),
      async (): Promise<void> => {
        try {
          // Wait for fonts to load first
          await this.page.evaluate(() => document.fonts.ready);
          
          const screenshot: Buffer = await this.page.screenshot({
            fullPage: true,
            timeout: 15000,
          });
          
          if (process.env.EmbedScreenshotsInReport === "true") {
            await this.testInfo.attach(`📸 ${description}`, {
              body: screenshot,
              contentType: "image/png",
            });
          }
        } catch (error) {
           throw new Error(`Screenshot skipped: ${error.message}`);
        }
      }
    );
  }

  public async waitForLoaderToDisappear(
    timeout: number = 30000
  ): Promise<void> {
    const loaderLocator = this.page.locator(
      "//div[@class='loading__inner']/p[normalize-space()='Just a moment']"
    );

    await test.step('⏳ Waiting for the loader "Just a moment" to disappear', async (): Promise<void> => {
      // Wait for the loader element to either become hidden or be removed from the DOM
      await loaderLocator.waitFor({ state: "hidden", timeout });

      await this.testInfo.attach('✅ Loader "Just a moment" has disappeared', {
        body: '✅ Loader "Just a moment" has disappeared',
        contentType: "text/plain",
      });
    });
  }

  public async waitForProcessingLoaderToDisappear(
    timeout: number = 30000
  ): Promise<void> {
    const loaderLocator = this.page.locator(
      "//div[@class='loading__inner']/p[normalize-space()='processing']"
    );

    await test.step("⏳ Waiting for the processing loader to disappear", async (): Promise<void> => {
      // Wait for the loader element to either become hidden or be removed from the DOM
      await loaderLocator.waitFor({ state: "hidden", timeout });

      await this.testInfo.attach("✅ Processing loader has disappeared", {
        body: "✅ Processing loader has disappeared",
        contentType: "text/plain",
      });
    });
  }

  public maskValue(value: string): string {
    return "*".repeat(value.length); // Masks the value with asterisks
  }

  public async getText(locatorInfo: LocatorInfo): Promise<null | string> {
    const elementTextContent =
      await test.step(`🐾 "${locatorInfo.description}" text is obtained`, async (): Promise<
        null | string
      > => {
        return locatorInfo.locator.textContent();
      });
    return elementTextContent;
  }

  public async verifyFileDownload(
    locatorInfo: LocatorInfo,
    timeout: number = 30000
  ): Promise<void> {
    await test.step(`🧪 Verifying file download after clicking "${locatorInfo.description}"`, async (): Promise<void> => {
      // Wait for the download event
      const downloadPromise = this.page.waitForEvent("download", { timeout });

      // Click the element that triggers the download
      await locatorInfo.locator.click();

      // Wait for the download to complete
      const download = await downloadPromise;

      // Verify the download exists
      if (download) {
        await this.testInfo.attach(
          `✅ File download started from "${locatorInfo.description}"`,
          {
            body: `✅ File download started from "${locatorInfo.description}"`,
            contentType: "text/plain",
          }
        );
      } else {
        await this.testInfo.attach(
          `💥 No file download detected from "${locatorInfo.description}"`,
          {
            body: `💥 No file download detected from "${locatorInfo.description}"`,
            contentType: "text/plain",
          }
        );
        throw new Error(
          `No file download detected from "${locatorInfo.description}"`
        );
      }
    });
  }

  public async verifyUserHasAccess(
    expectedUrl: string,
    shouldMatch: boolean
  ): Promise<void> {
    await test.step(`Verifying URL ${shouldMatch ? "matches" : "does not match"} "${expectedUrl}"`, async () => {
      try {
        const currentUrl = this.page.url();
        if (shouldMatch) {
          await this.assertAreEqual(
            expectedUrl,
            currentUrl,
            "User has access to the page"
          );
        } else {
          if (currentUrl === expectedUrl) {
            throw new Error("User should not have access to the page");
          }
        }
      } catch (error) {
        await this.testInfo.attach("💥 Failed to verify URL match status", {
          body: `Error: ${error.message}`,
          contentType: "text/plain",
        });
        throw new Error(
          `Failed to verify access match status: ${error.message}`
        );
      }
    });
  }

  public async verifyDropdownValues(
    inputText: string,
    expectedValues: string[]
  ): Promise<void> {
    await test.step(`🐾 Verifying dropdown values for ${inputText}`, async (): Promise<void> => {
      try {
        const inputLocator = this.page.locator(
          `//input[@placeholder="${inputText}"]`
        );
        await inputLocator.click();

        const dropdownOptionsLocator = this.page.locator(
          `//input[@placeholder="${inputText}"]/ancestor::div[contains(@class, "form-element")]//ul/li`
        );
        await dropdownOptionsLocator
          .first()
          .waitFor({ state: "visible", timeout: WaitTimes.SHORT });

        const optionsCount = await dropdownOptionsLocator.count();

        // Throw error if count doesn't match
        if (optionsCount !== expectedValues.length) {
          throw new Error(
            `Number of dropdown options (${optionsCount}) does not match expected values length (${expectedValues.length})`
          );
        }

        // Now verify each value exists
        for (const value of expectedValues) {
          const optionLocator = this.page.locator(
            `//input[@placeholder="${inputText}"]/ancestor::div[contains(@class, "form-element")]//ul/li[normalize-space()="${value}"]`
          );

          // Check if element exists
          const exists = await optionLocator.isVisible();
          if (!exists) {
            throw new Error(`Value "${value}" not found in dropdown`);
          }
        }
      } catch (error) {
        await this.testInfo.attach("💥 Failed to verify dropdown values", {
          body: `Error: ${error.message}`,
          contentType: "text/plain",
        });
        throw error;
      }
    });
  }

  public async isElementVisible(locatorInfo: LocatorInfo): Promise<boolean> {
    let result = false;

    await test.step(`🧪 Checking visibility of: "${locatorInfo.description}"`, async () => {
      try {
        result = await locatorInfo.locator.isVisible();
        if (result) {
          await this.testInfo.attach(
            `✅ Element "${locatorInfo.description}" is visible.`
          );
        } else {
          await this.testInfo.attach(
            `⚠️ Element "${locatorInfo.description}" is NOT visible.`
          );
        }
      } catch (error) {
        await this.testInfo.attach(
          `❌ Error while checking visibility of "${locatorInfo.description}":`,
          {
            body: `Error: ${error instanceof Error ? error.message : String(error)}`,
            contentType: "text/plain",
          }
        );
      }
    });

    return result;
  }

  /**
   * Private helper method to extract text values from dropdown items
   * @param dropdownItemsLocator - The locator info for the dropdown items
   * @returns Array of normalized text values
   */
  private async extractDropdownValues(dropdownItemsLocator: LocatorInfo): Promise<string[]> {
    const count = await dropdownItemsLocator.locator.count();
    const values: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await dropdownItemsLocator.locator.nth(i).textContent();
      if (text) {
        const normalizedText = text.replace(/\s+/g, ' ').trim();
        if (normalizedText) {
          values.push(normalizedText);
        }
      }
    }

    return values;
  }

  /**
   * Private helper method to open dropdown
   * @param dropdownTriggerLocator - The locator to trigger dropdown
   * @param hoverToOpen - Whether to hover or click
   */
  private async openDropdown(dropdownTriggerLocator: LocatorInfo, hoverToOpen: boolean): Promise<void> {
    if (hoverToOpen === true) {
      await dropdownTriggerLocator.locator.hover();
    } else {
        await dropdownTriggerLocator.locator.click();
      }
    await this.page.waitForTimeout(500);
  }

  /**
 * Get all values from a dropdown dynamically
 * @param dropdownTriggerLocator - The locator info for the element that triggers the dropdown (e.g., nav item to hover)
 * @param dropdownItemsLocator - The locator info for the dropdown items (e.g., all links in the dropdown)
 * @param hoverToOpen - Whether to hover over the trigger to open dropdown (default: true)
 * @returns Array of dropdown values as strings
 */
  public async getAllDropdownValues(
    dropdownTriggerLocator: LocatorInfo,
    dropdownItemsLocator: LocatorInfo,
    hoverToOpen: boolean = true
  ): Promise<string[]> {
    return await test.step(`📋 Getting all values from "${dropdownTriggerLocator.description}"`, async () => {
      try {
        await this.openDropdown(dropdownTriggerLocator, hoverToOpen);
        const values = await this.extractDropdownValues(dropdownItemsLocator);

        await this.testInfo.attach(`📋 Found ${values.length} items in "${dropdownTriggerLocator.description}"`, {
          body: `Items: ${values.join(' ')}`,
          contentType: 'text/plain',
        });

        return values;
      } catch (error) {
        await this.testInfo.attach(`💥 Failed to get dropdown values from "${dropdownTriggerLocator.description}"`, {
          body: `Error: ${error.message}`,
          contentType: 'text/plain',
        });
        throw error;
      }
    });
  }

  public async isElementHidden(locatorInfo: LocatorInfo): Promise<boolean> {
    let result = false;

    try {
      await test.step(`🧪 Checking visibility of: "${locatorInfo.description}"`, async () => {
        result = await locatorInfo.locator.isHidden();
        if (result) {
          await this.testInfo.attach(
            `✅ Element "${locatorInfo.description}" is hidden.`
          );
        } else {
          await this.testInfo.attach(
            `⚠️ Element "${locatorInfo.description}" is NOT hidden.`
          );
        }
      });
    } catch (error) {
      await this.testInfo.attach(
        `❌ Error while checking visibility of "${locatorInfo.description}":`,
        {
          body: `Error: ${error instanceof Error ? error.message : String(error)}`,
          contentType: "text/plain",
        }
      );
      throw error;
    }

    return result;
  }

/**
 * Verify all values in a dropdown are visible
 * @param dropdownTriggerLocator - The locator info for the element that triggers the dropdown
 * @param dropdownItemsLocator - The locator info for the dropdown items
 * @param hoverToOpen - Whether to hover over the trigger to open dropdown (default: true)
 * @returns Array of verified dropdown values
 */
public async verifyAllDropdownValues(
  dropdownTriggerLocator: LocatorInfo,
  dropdownItemsLocator: LocatorInfo,
  hoverToOpen: boolean = true
): Promise < string[] > {
  return await test.step(`✅ Verifying all values in "${dropdownTriggerLocator.description}"`, async () => {
    try {
      await this.openDropdown(dropdownTriggerLocator, hoverToOpen);
      const verifiedValues = await this.extractDropdownValues(dropdownItemsLocator);

      if (verifiedValues.length === 0) {
        throw new Error(`No items found in dropdown "${dropdownTriggerLocator.description}"`);
      }

      await this.page.mouse.move(0, 0);
      await this.page.waitForTimeout(300);

      if (process.env.EmbedScreenshotsInReport === 'true') {
        await this.embedFullPageScreenshot(`✅ All ${verifiedValues.length} items verified in "${dropdownTriggerLocator.description}"`);
      }

      await this.testInfo.attach(`✅ All items verified in "${dropdownTriggerLocator.description}"`, {
        body: `Verified ${verifiedValues.length} items: ${verifiedValues.join(', ')}`,
        contentType: 'text/plain',
      });

      return verifiedValues;
    } catch (error) {
      if (!error.message.includes('screenshot')) {
        await this.page.mouse.move(0, 0);
        await this.embedFullPageScreenshot(`💥 Failed to verify dropdown values in "${dropdownTriggerLocator.description}"`);
      }

      await this.testInfo.attach(`💥 Failed to verify dropdown values`, {
        body: `Error: ${error.message}`,
        contentType: 'text/plain',
      });
      throw error;
    }
  });
}

/**
 * Verify dropdown values match expected values
 * @param webDropdownTriggerLocator - The locator for web dropdown trigger (element to hover)
 * @param dropdownItemsLocator - The locator info for the dropdown items
 * @param expectedValues - Array of expected values to verify against
 * @param isWeb - Boolean to determine viewport behavior (true for web hover, false for mobile click)
 * @param exactMatch - Whether to check for exact match of values (default: true)
 */
  public async verifyDropdownValuesMatch(
  webDropdownTriggerLocator: LocatorInfo,
  dropdownItemsLocator: LocatorInfo,
  expectedValues: string[],
  hoverToOpen: boolean = true,
  exactMatch: boolean = true
): Promise < void> {
  await test.step(`🧪 Verifying dropdown values match expected in "${webDropdownTriggerLocator.description}"`, async () => {
    try {
      await this.openDropdown(webDropdownTriggerLocator, hoverToOpen);
      const actualValues = await this.extractDropdownValues(dropdownItemsLocator);

      if (exactMatch) {
        const isExactMatch = JSON.stringify(actualValues) === JSON.stringify(expectedValues);

        if (isExactMatch) {
          await this.testInfo.attach(`✅ Dropdown values match exactly`, {
            body: `Expected: ${expectedValues.join(', ')}\nActual: ${actualValues.join(', ')}`,
            contentType: 'text/plain',
          });
        } else {
          throw new Error(
            `Dropdown values don't match.\nExpected: [${expectedValues.join(', ')}]\nActual: [${actualValues.join(', ')}]`
          );
        }
      } else {
        const missingValues = expectedValues.filter(val => !actualValues.includes(val));
        const extraValues = actualValues.filter(val => !expectedValues.includes(val));

        if (missingValues.length > 0 || extraValues.length > 0) {
          let errorMsg = `Dropdown values mismatch:\n`;
          if (missingValues.length > 0) {
            errorMsg += `Missing: [${missingValues.join(', ')}]\n`;
          }
          if (extraValues.length > 0) {
            errorMsg += `Extra: [${extraValues.join(', ')}]\n`;
          }
          throw new Error(errorMsg);
        }

        await this.testInfo.attach(`✅ All expected dropdown values are present`, {
          body: `Expected values: ${expectedValues.join(', ')}\nActual values: ${actualValues.join(', ')}`,
          contentType: 'text/plain',
        });
      }
    } catch (error) {
      await this.testInfo.attach(`💥 Dropdown values verification failed`, {
        body: `Error: ${error.message}`,
        contentType: 'text/plain',
      });
      throw error;
    }
  });
}

  public async verifyPageElements(
  pageTo: LocatorInfo,
  cardContainerLocator: LocatorInfo,
  expectedCardTitle: string[]
): Promise < void> {
  await test.step(`🔍 Verifying page elements`, async (): Promise<void> => {
    try {
      await this.waitForDomLoad();

      await pageTo.locator.waitFor({ state: 'visible' });
      await pageTo.locator.click();

      // Hover away from the pageTo locator to avoid interference
      await this.page.mouse.move(0, 0);

      const foundElements: string[] = [];
      const missingElements: string[] = [...expectedCardTitle];
      let currentPage = 1;
      let hasNextPage = true;
      const visitedUrls = new Set<string>();
      const maxPages = 10; // Safety limit to prevent infinite loops

      while (hasNextPage && missingElements.length > 0 && currentPage <= maxPages) {
        // Track current URL to prevent infinite loops
        const currentUrl = this.page.url();
        if (visitedUrls.has(currentUrl)) {
          await this.testInfo.attach(`🔄 Detected URL loop - stopping pagination`, {
            body: `URL ${currentUrl} was already visited. Stopping to prevent infinite loop.`,
            contentType: 'text/plain',
          });
          break;
        }
        visitedUrls.add(currentUrl);

        await this.testInfo.attach(`📄 Checking page ${currentPage}`, {
          body: `Searching for ${missingElements.length} remaining elements on page ${currentPage}. URL: ${currentUrl}`,
          contentType: 'text/plain',
        });

        const cardLocator = cardContainerLocator.locator;
        const cardCount = await cardLocator.count();

        // Check each card on the current page
        for (let i = 0; i < cardCount; i++) {
          const currentCard = cardLocator.nth(i);
          const titleLocator = currentCard.locator('h1, h2, h3, h4, h5, h6, a, span, div').filter({ hasText: /.+/ });
          const titleCount = await titleLocator.count();

          if (titleCount > 0) {
            const titleText = await titleLocator.first().textContent();
            const trimmedTitle = titleText?.trim();

            if (trimmedTitle) {
              // Check if this title matches any of the missing elements
              const matchingElementIndex = missingElements.findIndex(element => 
                trimmedTitle === element
              );

              if (matchingElementIndex !== -1) {
                foundElements.push(trimmedTitle);
                missingElements.splice(matchingElementIndex, 1);
                
                await this.testInfo.attach(`✅ Found element: "${trimmedTitle}" on page ${currentPage}`, {
                  body: `Element "${trimmedTitle}" found on page ${currentPage}`,
                  contentType: 'text/plain',
                });
              }
            }
          }
        }

        // If all elements are found, break
        if (missingElements.length === 0) {
          await this.testInfo.attach(`🎉 All elements found!`, {
            body: `All ${expectedCardTitle.length} elements found across ${currentPage} page(s)`,
            contentType: 'text/plain',
          });
          break;
        }

        // Check for next page button using multiple strategies
        try {
          // Strategy 1: Look for common next page button patterns
          const nextPageButton = this.page.locator('//a[normalize-space()="Next »"]').first();          
          
          // Try to find a visible next page button
          let nextButton = null;
          let isNextPageVisible = false;

          // Check each strategy in order
          const strategies = [nextPageButton];
          
          for (const strategy of strategies) {
            try {
              isNextPageVisible = await strategy.isVisible();
              if (isNextPageVisible) {
                nextButton = strategy;
                break;
              }
            } catch (error) {
              // Continue to next strategy
              continue;
            }
          }

          if (nextButton && isNextPageVisible) {
            // Store URL before clicking to detect if we actually moved
            const urlBeforeClick = this.page.url();
            
            await this.testInfo.attach(`➡️ Navigating to page ${currentPage + 1}`, {
              body: `Clicking next page button to continue search`,
              contentType: 'text/plain',
            });

            await nextButton.click();
            await this.waitForDomLoad();
            
            // Check if URL actually changed
            const urlAfterClick = this.page.url();
            if (urlAfterClick === urlBeforeClick) {
              await this.testInfo.attach(`⚠️ URL did not change after clicking next - stopping pagination`, {
                body: `URL remained the same after clicking next button. Stopping pagination to prevent infinite loop.`,
                contentType: 'text/plain',
              });
              hasNextPage = false;
            } else {
              currentPage++;
            }
          } else {
            hasNextPage = false;
            await this.testInfo.attach(`🏁 Next page button is hidden - stopping pagination`, {
              body: `Next page button is not visible. Stopping pagination at page ${currentPage}.`,
              contentType: 'text/plain',
            });
          }
        } catch (error) {
          hasNextPage = false;
          await this.testInfo.attach(`⚠️ Could not check next page button`, {
            body: `Error checking next page button: ${error.message}`,
            contentType: 'text/plain',
          });
        }
      }

      // Check if we hit the safety limit
      if (currentPage > maxPages) {
        await this.testInfo.attach(`⚠️ Reached maximum page limit`, {
          body: `Reached maximum page limit of ${maxPages}. Stopping pagination to prevent infinite loop.`,
          contentType: 'text/plain',
        });
      }

      // Final verification and error handling
      if (missingElements.length > 0) {
        const errorMessage = `${missingElements.length} elements not found: ${missingElements.join(', ')}. Found ${foundElements.length} out of ${expectedCardTitle.length} elements.`;
        
        await this.testInfo.attach(`💥 Verification failed - Missing elements`, {
          body: `Missing: ${missingElements.join(', ')}\nFound: ${foundElements.join(', ')}\nTotal expected: ${expectedCardTitle.length}\nTotal found: ${foundElements.length}`,
          contentType: 'text/plain',
        });

        throw new Error(errorMessage);
      }

      await this.testInfo.attach(`✅ Successfully verified page elements and cards`, {
        body: `Verified all ${expectedCardTitle.length} elements across ${currentPage} page(s): ${foundElements.join(', ')}`,
        contentType: 'text/plain',
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.testInfo.attach(`💥 Failed to verify page elements and cards`, {
        body: `Error: ${errorMessage}`,
        contentType: 'text/plain',
      });
      throw error;
    }
  });
}


  public async verifyAllPageElements(
  pageTo: LocatorInfo,
  containerLocator: LocatorInfo,
  expectedElements: string[]
): Promise < void> {
  await test.step(`🔍 Verifying elements page elements`, async (): Promise<void> => {
    try {
      await this.waitForDomLoad();

      await pageTo.locator.waitFor({ state: 'visible' });
      await pageTo.locator.click();

      // Hover away from the pageTo locator to avoid interference
      await this.page.mouse.move(0, 0);

      // Wait for the container to be visible
      await containerLocator.locator.waitFor({ state: 'visible' });

      // Get the text content of the container
      const containerText = await containerLocator.locator.textContent();
      expect(containerText, 'Container should have text content').toBeTruthy();

      // Verify that each expected element appears in the container text
      const missingElements: string[] = [];
      const foundElements: string[] = [];

      for (const expectedElement of expectedElements) {
        if (containerText?.includes(expectedElement)) {
          foundElements.push(expectedElement);
        } else {
          missingElements.push(expectedElement);
        }
      }

      // Log the results
      await this.testInfo.attach(`📊 Elements verification results`, {
        body: `Found: ${foundElements.join(', ')}\nMissing: ${missingElements.join(', ')}\nTotal expected: ${expectedElements.length}\nTotal found: ${foundElements.length}`,
        contentType: 'text/plain',
      });

      // Console log for missing elements
      if (missingElements.length > 0) {
        throw new Error(`❌ Missing elements detected: ${missingElements.join(', ')}`);
      } else {
        console.log(`✅ All elements found successfully: ${foundElements.join(', ')}`);
      }

      // Assert that all expected occasions are found - this will fail the test if any are missing
      if (missingElements.length > 0) {
        const errorMessage = `Missing elements: ${missingElements.join(', ')}. Expected ${expectedElements.length} elements but found ${foundElements.length}.`;
        await this.testInfo.attach(`💥 Test failed - Missing elements detected`, {
          body: errorMessage,
          contentType: 'text/plain',
        });
        throw new Error(errorMessage);
      }

      expect(foundElements.length, `Expected to find ${expectedElements.length} elements, but found ${foundElements.length}`).toBe(expectedElements.length);

      await this.testInfo.attach(`✅ Successfully verified elements page elements`, {
        body: `Verified all ${expectedElements.length} elements are present: ${expectedElements.join(', ')}`,
        contentType: 'text/plain',
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.testInfo.attach(`💥 Failed to verify elements page elements`, {
        body: `Error: ${errorMessage}`,
        contentType: 'text/plain',
      });
      throw error;
    }
  });
}
}