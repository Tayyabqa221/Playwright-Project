import { LocatorInfo } from '@interfaces/locator.info.interface';
import { Page, test, TestInfo } from '@playwright/test';
import path from 'path';

export enum WaitTimes {
  EXTRA_LONG = 60000, // 60 seconds
  LONG = 10000, // 10 seconds
  LONGER = 15000, // 15 seconds
  MAXIMUM = 120000, // 120 seconds
  MEDIUM = 5000, // 5 seconds
  SHORT = 2000, // 2 seconds
  VERY_LONG = 30000, // 30 seconds
}
export class PlaywrightActionFactory {
  private readonly page: Page;
  private readonly testInfo: TestInfo;

  /**
   * @param page
   * @param testInfo
   */

  public constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
  }

  public async countElements(locatorInfo: LocatorInfo): Promise<number> {
    return await test.step(`🐾 Counting elements: "${locatorInfo.description}"`, async (): Promise<number> => {
      return await locatorInfo.locator.count();
    });
  }
  public maskValue(value: string): string {
    return '*'.repeat(value.length); // Masks the value with asterisks
  }

  public async click(locatorInfo: LocatorInfo): Promise<void> {
    await test.step(`🐾 "${locatorInfo.description}" is clicked`, async (): Promise<void> => {
      await this.waitForSelector(locatorInfo);
      await locatorInfo.locator.scrollIntoViewIfNeeded();
      await locatorInfo.locator.click();
      await this.testInfo.attach(`🐾 "${locatorInfo.description}" is clicked`, {
        body: `🐾 "${locatorInfo.description}" is clicked`,
        contentType: 'text/plain',
      });
    });
  }

  public async doubleClick(locatorInfo: LocatorInfo): Promise<void> {
    await test.step(`🐾 "${locatorInfo.description}" is double-clicked`, async (): Promise<void> => {
      await this.waitForSelector(locatorInfo);
      await locatorInfo.locator.scrollIntoViewIfNeeded();
      await locatorInfo.locator.dblclick();
      await this.testInfo.attach(`🐾 "${locatorInfo.description}" is double-clicked`, {
        body: `🐾 "${locatorInfo.description}" is double-clicked`,
        contentType: 'text/plain',
      });
    });
  }

  public async selectRadioButtonOrCheckBox(locatorInfo: LocatorInfo): Promise<void> {
    await test.step(`🐾 "${locatorInfo.description}" is selected`, async (): Promise<void> => {
      try {
        await locatorInfo.locator.check();
        await this.testInfo.attach(`🐾 "${locatorInfo.description}" is selected`, {
          body: `🐾 "${locatorInfo.description}" is selected`,
          contentType: 'text/plain',
        });
      } catch (error) {
        await this.testInfo.attach(`🐾 "${locatorInfo.description}" is not selected - ` + error.message(), {
          body: `🐾 "${locatorInfo.description}" is not selected`,
          contentType: 'text/plain',
        });
      }
    });
  }

  public async deSelectRadioButtonOrCheckBox(locatorInfo: LocatorInfo): Promise<void> {
    await test.step(`🐾 "${locatorInfo.description}" is selected`, async (): Promise<void> => {
      try {
        await locatorInfo.locator.uncheck();
        await this.testInfo.attach(`🐾 "${locatorInfo.description}" is selected`, {
          body: `🐾 "${locatorInfo.description}" is selected`,
          contentType: 'text/plain',
        });
      } catch (error) {
        await this.testInfo.attach(`🐾 "${locatorInfo.description}" is not selected - ` + error.message(), {
          body: `🐾 "${locatorInfo.description}" is not selected`,
          contentType: 'text/plain',
        });
      }
    });
  }

  public async navigateToURL(url: string): Promise<void> {
    await test.step(`⏩ Navigate to URL: ${url}`, async (): Promise<void> => {
      await this.page.goto(url);
      await this.testInfo.attach(`⏩ Navigated to URL: ${url}`, {
        body: `⏩ Navigated to URL: ${url}`,
        contentType: 'text/plain',
      });
    });
  }

  public async scrollIntoView(locatorInfo: LocatorInfo): Promise<void> {
    await test.step(`📜 Scrolling "${locatorInfo.description}" into view`, async (): Promise<void> => {
      await locatorInfo.locator.scrollIntoViewIfNeeded();
      await this.testInfo.attach(`📜 "${locatorInfo.description}" scrolled into view`, {
        body: `📜 "${locatorInfo.description}" scrolled into view`,
        contentType: 'text/plain',
      });
    });
  }

  public async scrollByKeyword(keyword: string): Promise<void> {
    await test.step(`📜 Scrolling by keyword: "${keyword}"`, async (): Promise<void> => {
      await this.page.keyboard.press(keyword);
      await this.testInfo.attach(`📜 Scrolled by keyword: "${keyword}"`, {
        body: `📜 Scrolled by keyword: "${keyword}"`,
        contentType: 'text/plain',
      });
    });
  }

  public async sendKeys(locatorInfo: LocatorInfo, strValue: string, mask: boolean = false): Promise<void> {
    const displayedValue = mask ? this.maskValue(strValue) : strValue;
    await test.step(`🐾 "${locatorInfo.description}" is entered with "${displayedValue}"`, async (): Promise<void> => {
      await locatorInfo.locator.scrollIntoViewIfNeeded();
      await locatorInfo.locator.fill(strValue);
      await this.testInfo.attach(`🐾 "${locatorInfo.description}" is entered with "${displayedValue}"`, {
        body: `🐾 "${locatorInfo.description}" is entered with "${displayedValue}"`,
        contentType: 'text/plain',
      });
    });
  }

  public async writeTextonClipboard(strValue: string): Promise<void> {
    await test.step(`🐾 "${strValue}" is written on clipboard`, async (): Promise<void> => {
    await this.page.evaluate(async (value) => {
      await navigator.clipboard.writeText(value);
    }, strValue);
    });
  }

  public async pasteText(locatorInfo: LocatorInfo, strValue: string): Promise<void> {
    await test.step(`🐾 "${locatorInfo.description}" is pasted with "${strValue}"`, async (): Promise<void> => {
      await locatorInfo.locator.scrollIntoViewIfNeeded();
      await locatorInfo.locator.focus();
      await this.writeTextonClipboard(strValue);
      await this.page.keyboard.press('Meta+v');
      await this.testInfo.attach(`🐾 "${locatorInfo.description}" is pasted with "${strValue}"`, {
        body: `🐾 "${locatorInfo.description}" is pasted with "${strValue}"`,
        contentType: 'text/plain',
      });
    });
  }

  public async sendKeysSequentially(locatorInfo: LocatorInfo, strValue: string, mask: boolean = false): Promise<void> {
    const displayedValue = mask ? this.maskValue(strValue) : strValue;
    await test.step(`🐾 "${locatorInfo.description}" is entered with "${displayedValue}"`, async (): Promise<void> => {
      await locatorInfo.locator.scrollIntoViewIfNeeded();
      await locatorInfo.locator.pressSequentially(strValue);
      await this.testInfo.attach(`🐾 "${locatorInfo.description}" is entered with "${displayedValue}"`, {
        body: `🐾 "${locatorInfo.description}" is entered with "${displayedValue}"`,
        contentType: 'text/plain',
      });
    });
  }

  public async pressKey(locatorInfo: LocatorInfo, strValue: string): Promise<void> {
    await test.step(`🐾 "${locatorInfo.description}" is pressed with "${strValue}"`, async (): Promise<void> => {
      await locatorInfo.locator.scrollIntoViewIfNeeded();
      await locatorInfo.locator.press(strValue);
      await this.testInfo.attach(`🐾 "${locatorInfo.description}" is pressed with "${strValue}"`, {
        body: `🐾 "${locatorInfo.description}" is pressed with "${strValue}"`,
        contentType: 'text/plain',
      });
    });
  }

  public async clearText(locatorInfo: LocatorInfo): Promise<void> {
    await test.step(`🐾 "${locatorInfo.description}" is erased`, async (): Promise<void> => {
      await this.click(locatorInfo);
      await this.page.waitForTimeout(1000);
      await locatorInfo.locator.selectText();
      await this.page.waitForTimeout(500);
      await locatorInfo.locator.press('Backspace');
      await this.page.waitForTimeout(1000);
      await this.testInfo.attach(`🐾 "${locatorInfo.description}" is erased`, {
        body: `Text cleared from "${locatorInfo.description}"`,
        contentType: 'text/plain',
      });
    });
  }

  public async waitForDomLoad(timeout: number = WaitTimes.VERY_LONG): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }

  public async waitForNetworkIdle(timeout: number = WaitTimes.VERY_LONG): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  public async waitForSec(seconds: number): Promise<void> {
    await test.step(`⏳ Waiting for ${seconds} second(s)`, async (): Promise<void> => {
      await this.page.waitForTimeout(seconds * 1000); // Convert seconds to milliseconds
      await this.testInfo.attach(`⏳ Waited for ${seconds} second(s)`, {
        body: `Waited for ${seconds} second(s)`,
        contentType: 'text/plain',
      });
    });
  }

  public async waitForSelector(
    locatorInfo: LocatorInfo,
    timeout: number = 30000,
    state: 'attached' | 'detached' | 'visible' | 'hidden' = 'visible',
  ): Promise<void> {
    await test.step(`⏳ Waiting for "${locatorInfo.description}" to be ${state}`, async (): Promise<void> => {
      await locatorInfo.locator.waitFor({ state, timeout });
      await this.testInfo.attach(`⏳ "${locatorInfo.description}" is ${state}`, {
        body: `⏳ "${locatorInfo.description}" is ${state}`,
        contentType: 'text/plain',
      });
    });
  }

  public resolveResponsiveLocator(
    baseLocator: LocatorInfo,
    isWeb: boolean,
    mobileDescription?: string
  ): LocatorInfo {
    if (isWeb) {
      return baseLocator;
    }

    if (process.env.NODE_locale === "fr") {
      return {
        description: mobileDescription ?? `${baseLocator.description} (mobile)`,
        locator: this.page.locator(
          '//div[@class="mobile_menu open"]'
        ).locator(baseLocator.locator),
      };
    }

    return {
      description: mobileDescription ?? `${baseLocator.description} (mobile)`,
      locator: baseLocator.locator,
    };
  }

  public async forceClick(locatorInfo: LocatorInfo): Promise<void> {
    await test.step(`🐾 "${locatorInfo.description}" is clicked`, async (): Promise<void> => {
      await this.waitForSelector(locatorInfo);
      await locatorInfo.locator.scrollIntoViewIfNeeded();
      await locatorInfo.locator.click({ force: true });
      await this.testInfo.attach(`🐾 "${locatorInfo.description}" is clicked`, {
        body: `🐾 "${locatorInfo.description}" is clicked`,
        contentType: 'text/plain',
      });
    });
  }

  public async grantClipboardPermissions(): Promise<void> {
    await test.step('⏩ Grant Clipboard Permissions', async (): Promise<void> => {
      try {
        // Try to grant both clipboard-read and clipboard-write permissions
        // This works for Chromium-based browsers (Chrome, Chromium)
        await this.page.context().grantPermissions(['clipboard-read', 'clipboard-write'], {});
      } catch (error: any) {
        // Check if the error is about unknown clipboard permissions
        const isClipboardPermissionError = error.message && 
          error.message.includes('Unknown permission') && 
          (error.message.includes('clipboard-read') || error.message.includes('clipboard-write'));
        
        if (isClipboardPermissionError) {
          // If clipboard-read is not supported, try clipboard-write only
          // This works for Firefox and Edge
          if (error.message.includes('clipboard-read')) {
            try {
              await this.page.context().grantPermissions(['clipboard-write'], {});
            } catch (fallbackError: any) {
              // If clipboard-write also fails (Safari), skip permissions gracefully
              if (fallbackError.message && fallbackError.message.includes('Unknown permission')) {
                // Safari doesn't support clipboard permissions via grantPermissions
                // The clipboard API may still work through user interactions
                console.warn(`Clipboard permissions not supported in this browser (Safari). Clipboard operations may work through user interactions.`);
              } else {
                throw fallbackError;
              }
            }
          } else {
            // If clipboard-write fails directly (Safari), skip permissions gracefully
            console.warn(`Clipboard permissions not supported in this browser (Safari). Clipboard operations may work through user interactions.`);
          }
        } else {
          // Re-throw if it's a different error
          throw error;
        }
      }
    });
  }
  
  public async readClipboardText(): Promise<string> {
    return await test.step('📋 Read Clipboard Text', async (): Promise<string> => {
      try {
        return await this.page.evaluate(async () => {
          return await navigator.clipboard.readText();
        });
      } catch (error: any) {
        // For non-Chromium browsers, clipboard reading might not be supported
        // Try alternative approach or throw a more descriptive error
        if (error.message && (error.message.includes('clipboard') || error.message.includes('permission'))) {
          throw new Error(`Clipboard reading not supported in this browser. Error: ${error.message}`);
        }
        throw error;
      }
    });
  }
  
  public async changeProfilePicture(locatorInfo: LocatorInfo, filePath: string): Promise<void> {
    await test.step(`🐾 Changing profile picture to "${filePath}"`, async (): Promise<void> => {
      await this.uploadFile(
          locatorInfo,
          filePath
      );
      await this.waitForSec(2);
      await this.testInfo.attach(`🐾 Profile picture changed to "${filePath}"`, {
        body: `🐾 Profile picture changed to "${filePath}"`,
        contentType: 'text/plain',
      });
    });
    return;
  }

  /**
   * Set input files to a hidden file input for uploading documents
   *
   * @param locatorInfo Information about the file input locator
   * @param filePaths Array of file paths to be uploaded
   */
  public async setInputFiles(locatorInfo: LocatorInfo, filePaths: string | string[]): Promise<void> {
    await test.step(`📂 Upload files to "${locatorInfo.description}"`, async (): Promise<void> => {
      // Ensure filePaths is an array for consistency
      const filesArray = Array.isArray(filePaths) ? filePaths : [filePaths];

      // Set the input files on the specified locator
      await locatorInfo.locator.setInputFiles(filesArray);

      await this.testInfo.attach(`📂 Files uploaded to "${locatorInfo.description}"`, {
        body: `Uploaded files: ${filesArray.join(', ')}`,
        contentType: 'text/plain',
      });
    });
  }

  public async embedFullPageScreenshot(description: string): Promise<void> {
    await test.step(`📸 "${description} - Full page screenshot`.trim(), async (): Promise<void> => {
      const screenshot: Buffer = await this.page.screenshot({ fullPage: true });
      await this.testInfo.attach(`📸 ${description}`, {
        body: screenshot,
        contentType: 'image/png',
      });
    });
  }

  public async getText(locatorInfo: LocatorInfo): Promise<null | string> {
    const elementTextContent = await test.step(`🐾 "${locatorInfo.description}" text is obtained`, async (): Promise<
      null | string
    > => {
      return locatorInfo.locator.textContent();
    });
    return elementTextContent;
  }

  // ... existing code ...
  public async selectFromDropdown(locatorInfo: LocatorInfo, optionText: string, value?: string): Promise<void> {
    await test.step(`🐾 Selecting exact option: "${optionText}" from dropdown`, async (): Promise<void> => {
      // Check if it's a standard HTML select element
      const isStandardSelect = await locatorInfo.locator.evaluate((element) => {
        return element.tagName.toLowerCase() === 'select';
      });

      if (isStandardSelect) {
        // Handle standard HTML select element
        try {
          // Use selectOption for standard select elements
          await locatorInfo.locator.selectOption({ label: optionText });
          
          // Attach a message to the test report
          await this.testInfo.attach(`🐾 Selected "${optionText}" from standard select dropdown`, {
            body: `Selected "${optionText}" from standard select dropdown`,
            contentType: 'text/plain',
          });
        } catch (error) {
          // If label selection fails, try with value
          try {
            await locatorInfo.locator.selectOption(optionText);
            
            // Attach a message to the test report
            await this.testInfo.attach(`🐾 Selected "${optionText}" from standard select dropdown by value`, {
              body: `Selected "${optionText}" from standard select dropdown by value`,
              contentType: 'text/plain',
            });
          } catch (valueError) {
            throw new Error(`Option "${optionText}" not found in the standard select dropdown.`);
          }
        }
        return;
      }

      // Handle custom dropdown (existing logic)
      // Click to open the dropdown
      await locatorInfo.locator.focus();
      await locatorInfo.locator.click();

      // Locate the dropdown option that exactly matches the input text
      let exactMatchOption = this.page
        .locator('ul.form-element__custom-select-list li')
        .filter({
          hasText: new RegExp(`^\\s*${optionText}`),
        })
        .first();
      try {
        // Wait for the exact match option to be visible
        await exactMatchOption.waitFor({ state: 'visible', timeout: 10000 });

        // Scroll the element into view
        await exactMatchOption.scrollIntoViewIfNeeded();

        // Click the dropdown option
        await exactMatchOption.click({ force: true });

        if (value?.includes('multi')) {
          exactMatchOption = this.page
            .locator('ul.form-element__multi-select-list li.form-element__multi-select-option.')
            .filter({
              hasText: new RegExp(`^\\s*${optionText}`),
            })
            .first();
          try {
            // Wait for the exact match option to be visible
            await exactMatchOption.waitFor({ state: 'visible', timeout: 5000 });

            // Scroll the element into view
            await exactMatchOption.scrollIntoViewIfNeeded();

            // Click the dropdown option
            await exactMatchOption.click({ force: true });
            await this.testInfo.attach(`🐾 Selected "${optionText}" from the dropdown`, {
              body: `Selected "${optionText}" from the dropdown`,
              contentType: 'text/plain',
            });
          } catch (error) {
            if (error.message.includes('Timeout')) {
              throw new Error(`Option "${optionText}" not found in the dropdown.`);
            } else {
              throw error;
            }
          }
        }

        // Attach a message to the test report
        await this.testInfo.attach(`🐾 Selected "${optionText}" from the dropdown`, {
          body: `Selected "${optionText}" from the dropdown`,
          contentType: 'text/plain',
        });
      } catch (error) {
        if (error.message.includes('Timeout')) {
          throw new Error(`Option "${optionText}" not found in the dropdown.`);
        } else {
          throw error;
        }
      }
    });
  }

  public async labelSelectFromDropdown(locatorInfo: LocatorInfo, option: string): Promise<void> {
    await locatorInfo.locator.focus();
    await locatorInfo.locator.click();
    await test.step('Label Select From Dropdown', async () => {
      const exactMatchOption = this.page
        .locator(
          `//ul[contains(@class,"form-element__multi-select-list")]//li[contains(@class,"form-element__multi-select-option")]//label[contains(normalize-space(),"${option}")]`,
        )
        .filter({
          hasText: new RegExp(`^\\s*${option}`),
        })
        .first();
      try {
        await exactMatchOption.waitFor({ state: 'visible', timeout: 5000 });
        await exactMatchOption.scrollIntoViewIfNeeded();
        await exactMatchOption.click({ force: true });

        await this.testInfo.attach(`🐾 Selected "${option}" from label dropdown`, {
          body: `Selected "${option}" from label dropdown`,
          contentType: 'text/plain',
        });
      } catch (error) {
        if (error.message.includes('Timeout')) {
          throw new Error(`Label option "${option}" not found in dropdown.`);
        } else {
          throw error;
        }
      }
    });
  }

  public async searchAndSelect(locatorInfo: LocatorInfo, inputText: string, value?: string): Promise<void> {
    await test.step(`🐾 Enter "${inputText}" and select it from the dropdown`, async (): Promise<void> => {
      // Focus the input field
      await this.waitForSelector(locatorInfo);
      await locatorInfo.locator.focus();
      await locatorInfo.locator.clear();
      let dropdownOption;
      let exactMatchOption;

      // Wait for the dropdown to appear and contain the exact input text
      if (value?.includes('custom')) {
        await locatorInfo.locator.pressSequentially(inputText);
        dropdownOption = this.page.locator('ul.form-element__custom-select-list li', {
          hasText: inputText,
        });

        // Filter to match exact text for custom selects
        exactMatchOption = dropdownOption
          .filter({
            has: this.page.locator('span', { hasText: inputText }),
          })
          .first();
      } else if (value?.includes('autocomplete-without-li')) {
        // For autocomplete, use partial matching with RegExp
        await locatorInfo.locator.fill(inputText);
        dropdownOption = this.page
          .locator('ul.form-element__autocomplete-list app-risk-search-result.form-element__autocomplete-option')
          .filter({ hasText: new RegExp(inputText, 'i') })
          .first();

        // For autocomplete, we already have the filtered option
        exactMatchOption = dropdownOption;

        // Wait for the dropdown to contain options
        await this.page.waitForSelector(
          'ul.form-element__autocomplete-list app-risk-search-result.form-element__autocomplete-option',
          {
            timeout: WaitTimes.LONG,
          },
        );
      } else if (value?.includes('autocomplete')) {
        // For autocomplete, use partial matching with RegExp
        await locatorInfo.locator.fill(inputText);
        dropdownOption = this.page
          .locator('ul.form-element__autocomplete-list li.form-element__autocomplete-option')
          .filter({ hasText: new RegExp(inputText, 'i') })
          .first();

        // For autocomplete, we already have the filtered option
        exactMatchOption = dropdownOption;

        // Wait for the dropdown to contain options
        await this.page.waitForSelector('ul.form-element__autocomplete-list li.form-element__autocomplete-option', {
          state: 'visible',
          timeout: WaitTimes.LONG,
        });
      } else if (value?.includes('multi')) {
        // For autocomplete, use partial matching with RegExp
        await locatorInfo.locator.fill(inputText);
        dropdownOption = this.page
          .locator('ul.form-element__multi-select-list li.form-element__multi-select-option')
          .filter({ hasText: new RegExp(inputText, 'i') })
          .first();

        // For autocomplete, we already have the filtered option
        exactMatchOption = dropdownOption;

        // Wait for the dropdown to contain options
        await this.page.waitForSelector('ul.form-element__multi-select-list li.form-element__multi-select-option', {
          timeout: WaitTimes.LONG,
        });
      } else if (value?.includes('custom-options')) {
        // For autocomplete, use partial matching with RegExp
        await locatorInfo.locator.fill(inputText);
        dropdownOption = this.page
          .locator('ul.form-element__custom-select-list li.form-element__custom-select-option')
          .filter({ hasText: new RegExp(inputText, 'i') })
          .first();

        // For autocomplete, we already have the filtered option
        exactMatchOption = dropdownOption;

        // Wait for the dropdown to contain options
        await this.page.waitForSelector('ul.form-element__multi-select-list li.form-element__multi-select-option', {
          timeout: WaitTimes.LONG,
        });
      } else {
        // Default behavior (exact matching)
        await locatorInfo.locator.fill(inputText);
        dropdownOption = this.page.locator('ul.form-element__autocomplete-list li', {
          hasText: inputText,
        });

        // Filter to match exact text
        exactMatchOption = dropdownOption
          .filter({
            has: this.page.locator('span', { hasText: inputText }),
          })
          .first();
      }

      try {
        // Wait for the match option to be visible
        await exactMatchOption.waitFor({ state: 'visible', timeout: WaitTimes.LONGER });

        // Scroll the element into view
        await exactMatchOption.scrollIntoViewIfNeeded();

        // Click the dropdown option
        await exactMatchOption.click({ force: true });

        // Attach a message to the test report
        await this.testInfo.attach(`🐾 Selected "${inputText}" from the dropdown`, {
          body: `Selected ${value?.includes('autocomplete') ? 'first matching' : 'exact matching'} item for "${inputText}" from the dropdown`,
          contentType: 'text/plain',
        });
      } catch (error) {
        // Handle timeout or other errors
        if (error.message.includes('Timeout')) {
          throw new Error(
            `Option ${value?.includes('autocomplete') ? 'containing' : 'matching exactly'} "${inputText}" not found in the dropdown.`,
          );
        } else {
          throw new Error(`An error occurred while selecting "${inputText}" from the dropdown: ${error.message}`);
        }
      }
    });
  }

  public async refreshBrowser(): Promise<void> {
    await test.step('🔄 Refreshing the browser', async () => {
      try {
        await this.page.reload();
        await this.waitForDomLoad();
        await this.testInfo.attach('🔄 Browser refreshed', {
          body: '🔄 The browser has been refreshed.',
          contentType: 'text/plain',
        });
      } catch (error) {
        await this.testInfo.attach('🔄 Browser refresh failed', {
          body: `Error: ${error.message}`,
          contentType: 'text/plain',
        });
      }
    });
  }

  public async waitForURL(regex: RegExp, timeout: number = 30000): Promise<void> {
    await test.step(`⏳ Waiting for URL matching "${regex}"`, async (): Promise<void> => {
      await this.page.waitForURL(regex, { timeout, waitUntil: 'domcontentloaded' });
      await this.testInfo.attach(`⏳ URL matching "${regex}" is loaded`, {
        body: `⏳ URL matching "${regex}" is loaded`,
        contentType: 'text/plain',
      });
    });
  }

  public async scrollUntilVisible(
    locatorInfo: LocatorInfo,
    options?: {
      maxScrollAttempts?: number;
      scrollAmount?: number;
      scrollInterval?: number;
    },
  ): Promise<void> {
    const { maxScrollAttempts = 10, scrollAmount = 100, scrollInterval = 300 } = options || {};
    let attempts = 0;

    await test.step(`📜 Scrolling to make "${locatorInfo.description}" visible`, async (): Promise<void> => {
      try {
        while (attempts < maxScrollAttempts) {
          const isVisible = await locatorInfo.locator.isVisible();

          if (isVisible) {
            await this.testInfo.attach(`✅ "${locatorInfo.description}" is visible after scrolling.`, {
              body: `Scrolled ${attempts} times to make "${locatorInfo.description}" visible.`,
              contentType: 'text/plain',
            });
            return;
          }

          await this.page.mouse.wheel(0, scrollAmount);
          await this.page.waitForTimeout(scrollInterval);
          attempts++;
        }

        await this.testInfo.attach(
          `💥 "${locatorInfo.description}" is not visible after ${maxScrollAttempts} scrolling attempts.`,
          {
            body: `Failed to scroll ${maxScrollAttempts} times to make "${locatorInfo.description}" visible.`,
            contentType: 'text/plain',
          },
        );
        throw new Error(`"${locatorInfo.description}" is not visible after ${maxScrollAttempts} attempts.`);
      } catch (error) {
        await this.testInfo.attach(`💥 Error while scrolling to "${locatorInfo.description}"`, {
          body: `Error: ${error.message}`,
          contentType: 'text/plain',
        });
        throw error;
      }
    });
  }

  public async mouseHover(locatorInfo: LocatorInfo): Promise<void> {
    await test.step(`🐾 Mouse hover on "${locatorInfo.description}"`, async (): Promise<void> => {
      await this.waitForSelector(locatorInfo);
      await locatorInfo.locator.scrollIntoViewIfNeeded();
      await locatorInfo.locator.hover();
      await this.testInfo.attach(`🐾 Mouse hover on "${locatorInfo.description}"`, {
        body: `🐾 Mouse hover on "${locatorInfo.description}"`,
        contentType: 'text/plain',
      });
    });
  }

  public static getFilePath(fileName: string): string {
    return path.resolve(process.cwd(), 'src', 'data', 'files', fileName);
  }

  public async uploadFile(locatorInfo: LocatorInfo, filePath: string): Promise<void> {
    await test.step(`📁 Uploading file "${path.basename(filePath)}"`, async (): Promise<void> => {

      await locatorInfo.locator.waitFor({ state: 'attached', timeout: 30000 });
      await locatorInfo.locator.setInputFiles(filePath);
      await this.testInfo.attach(`📁 File "${path.basename(filePath)}" uploaded successfully`, {
        body: `File "${path.basename(filePath)}" uploaded successfully`,
        contentType: 'text/plain',
      });
    });
  }

  public async getInputValue(locatorInfo: LocatorInfo): Promise<string> {
    return await test.step(`📝 Getting value from "${locatorInfo.description}"`, async (): Promise<string> => {
      await this.waitForSelector(locatorInfo);
      const value = await locatorInfo.locator.inputValue();
      await this.testInfo.attach(`📝 Value from "${locatorInfo.description}" is "${value}"`, {
        body: `Value from "${locatorInfo.description}" is "${value}"`,
        contentType: 'text/plain',
      });
      return value;
    });
  }

  public async hover(locatorInfo: LocatorInfo): Promise<void> {
    await test.step(`🖱️ Hovering over "${locatorInfo.description}"`, async (): Promise<void> => {
      await this.waitForSelector(locatorInfo);
      await locatorInfo.locator.scrollIntoViewIfNeeded();
      await locatorInfo.locator.hover();
      await this.testInfo.attach(`🖱️ Hovered over "${locatorInfo.description}"`, {
        body: `🖱️ Hovered over "${locatorInfo.description}"`,
        contentType: 'text/plain',
      });
    });
  }

  public async dragAndDrop(sourceLocator: LocatorInfo, targetLocator: LocatorInfo): Promise<void> {
    await test.step(`🐾 Dragging "${sourceLocator.description}" to "${targetLocator.description}"`, async (): Promise<void> => {
      await this.waitForSelector(sourceLocator);
      await this.waitForSelector(targetLocator);
      await sourceLocator.locator.scrollIntoViewIfNeeded();
      await sourceLocator.locator.dragTo(targetLocator.locator);
      await this.testInfo.attach(`🐾 Dragged "${sourceLocator.description}" to "${targetLocator.description}"`, {
        body: `🐾 Dragged "${sourceLocator.description}" to "${targetLocator.description}"`,
        contentType: 'text/plain',
      });
    });
  }

  public async clickAllElements(elements: LocatorInfo): Promise<void> {
    const count = await elements.locator.count();

    await test.step(`🐾 Clicking ${count} element(s) for: "${elements.description}" `, async (): Promise<void> => {
      for (let i = 0; i < count; i++) {
        await elements.locator.nth(i).click();
      }
    });
  }

  public async calculateEndDate(startDateValue: string): Promise<string> {
    // Parse the start date (assuming format DD/MM/YYYY)
    const [day, month, year] = startDateValue.split('/');
    const startDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));

    // Add 365 days to the start date
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 365);

    // Format the end date as DD/MM/YYYY
    return endDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  /**
   * Select a specific value from a dropdown menu
   * This is a dynamic, reusable function that works with any dropdown
   * 
   * @param webDropdownTriggerLocator - The locator for web dropdown trigger (element to hover)
   * @param mobileDropdownTriggerLocator - The locator for mobile dropdown trigger (element to click)
   * @param dropdownValue - The text value to select from the dropdown
   * @param isWeb - Boolean to determine viewport behavior (true for web hover, false for mobile click)
   * @param dropdownItemsLocator - Optional custom locator for dropdown items
   * @param timeout - Timeout in milliseconds (default: 15000)
   */
  public async selectDropdownValue(
    webDropdownTriggerLocator: LocatorInfo,
    mobileDropdownTriggerLocator: LocatorInfo,
    dropdownValue: string,
    isWeb: boolean,
    dropdownItemsLocator?: LocatorInfo,
    timeout: number = 15000
  ): Promise<void> {
    // Select the appropriate locator based on viewport
    const dropdownTriggerLocator = isWeb ? webDropdownTriggerLocator : mobileDropdownTriggerLocator;
    
    await test.step(`📋 Selecting "${dropdownValue}" from "${dropdownTriggerLocator.description}"`, async (): Promise<void> => {
      try {
        await this.waitForSelector(dropdownTriggerLocator, timeout);
        await dropdownTriggerLocator.locator.scrollIntoViewIfNeeded();
        
        // Apply conditional logic based on viewport (web vs mobile)
        if (isWeb) {
          // For web: hover on the element to open dropdown
          await this.mouseHover(dropdownTriggerLocator);
        } else {
          // For mobile: click on the element to open dropdown
          await dropdownTriggerLocator.locator.click({ force: true, timeout: 5000 });
        }
        
        // Wait for dropdown to open and items to be visible
        await this.waitForSec(3);

        const dropdownItemLocator = dropdownItemsLocator
          ? dropdownItemsLocator.locator.filter({ hasText: dropdownValue }).first()
          : this.page.locator('a, button, li, div[role="menuitem"]').filter({ hasText: dropdownValue }).first();

        await dropdownItemLocator.waitFor({ state: 'visible', timeout });
        await dropdownItemLocator.scrollIntoViewIfNeeded();
        await this.waitForSec(1);
        
        // Try to click the element, with retry logic
        let clicked = false;
        for (let attempt = 0; attempt < 3 && !clicked; attempt++) {
          try {
            await dropdownItemLocator.click({ force: true, timeout: 5000 });
            clicked = true;
          } catch (error) {
            if (attempt < 2) {
              await this.waitForSec(1);
              await dropdownItemLocator.scrollIntoViewIfNeeded();
            } else {
              throw error;
            }
          }
        }
        await this.waitForDomLoad();

        await this.testInfo.attach(`✅ Selected "${dropdownValue}" from "${dropdownTriggerLocator.description}"`, {
          body: `Value: "${dropdownValue}"`,
          contentType: 'text/plain',
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        await this.testInfo.attach(`💥 Failed to select "${dropdownValue}"`, {
          body: `Dropdown: "${dropdownTriggerLocator.description}"\nValue: "${dropdownValue}"\nError: ${errorMessage}`,
          contentType: 'text/plain',
        });

        throw new Error(
          `Failed to select "${dropdownValue}" from "${dropdownTriggerLocator.description}". Error: ${errorMessage}`
        );
      }
    });
  }
}
