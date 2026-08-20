import { expect, Page, TestInfo } from "@playwright/test";
import { LocatorInfo } from "@interfaces/locator.info.interface";
import { PlaywrightActionFactory } from "@utilities/playwright.actions.utils";
import fs from "fs";
import path from "path";

/**
 * New Meeting page (upload audio, notes). Upload form: #upload-form > input[type=file][name=byo_audio].
 */
export class NewMeetingPage {
  private readonly page: Page;
  private readonly playwrightActionsFactory: PlaywrightActionFactory;
  private readonly locators: { [key: string]: LocatorInfo };

  constructor(page: Page, _testInfo: TestInfo) {
    this.page = page;
    this.playwrightActionsFactory = new PlaywrightActionFactory(page, _testInfo);
    this.locators = {
      newMeetingBtn: {
        description: "New meeting button (sidebar dropdown trigger only)",
        locator: page.locator("#new-meeting-menu-trigger"),
      },
      newMeetingMenuContent: {
        description: "New meeting dropdown menu",
        locator: page.locator("#new-meeting-menu-content"),
      },
      uploadMeetingAudioOption: {
        description: "Upload audio option",
        locator: page
          .locator("#new-meeting-menu-content")
          .locator('a[role="menuitem"], [role="menuitem"]')
          .filter({ hasText: /upload.*audio/i })
          .first(),
      },
      meetingCapturedLabel: {
        description: "Meeting captured label",
        locator: page.getByText(/meeting captured/i),
      },
      submitUploadBtn: {
        description: "Submit button in upload form",
        locator: page.locator("#upload-form button[type='submit']"),
      },
      uploadingAudioStatus: {
        description: "Uploading audio status (in dropzone)",
        locator: page.locator("#audio-upload-dropzone").getByText(/uploading audio/i),
      },
      notesProcessingMessage: {
        description: "Notes processing / generating notes",
        locator: page
          .getByText(/notes will appear after processing completes/i)
          .or(page.getByText(/notes will appear.*processing/i))
          .or(page.getByText(/processing completes/i))
          .or(page.getByText(/generating notes/i)),
      },
      notesPlaceholder: {
        description: "Notes will appear after the meeting is captured (initial placeholder)",
        locator: page.getByText(/notes will appear after the meeting is captured/i),
      },
      selectFileUploadTrigger: {
        description: "Select file upload trigger",
        locator: page
          .locator("#upload-form")
          .locator(
            "xpath=.//div[@class='pc-button pc-button--gray-outline pc-button--md cursor-pointer']"
          ),
      },
      uploadFormFileInput: {
        description: "Upload form hidden file input",
        locator: page.locator("#upload-form input[type='file'][name='byo_audio']"),
      },
      sendNotetakerMenuItem: {
        description: "Send notetaker to meeting menu item",
        locator: page
          .locator("#new-meeting-menu-content")
          .getByRole("menuitem", { name: /send notetaker to meeting/i }),
      },
      sendNotetakerFormUrl: {
        description: "Meeting URL input on send-to-meeting page",
        locator: page.locator("#form_url"),
      },
      sendNotetakerSubmitBtn: {
        description: "Send notetaker submit button",
        locator: page
          .getByRole("button", { name: /send notetaker/i })
          .or(page.getByRole("dialog").getByRole("button", { name: /send notetaker/i })),
      },
      notetakerToast: {
        description: "Toast: Your notetaker should be joining the meeting now",
        locator: page.getByText(/your notetaker should be joining the meeting now|notetaker.*joining the meeting/i),
      },
      joinMyCallMenuItem: {
        description: "Join my call menu item",
        locator: page
          .locator("#new-meeting-menu-content")
          .getByRole("menuitem", { name: /join my call/i }),
      },
      joinMyCallDialog: {
        description: "Join my call dialog",
        locator: page.getByRole("dialog").filter({ hasText: /join my call|call now/i }),
      },
      joinMyCallPhoneInput: {
        description: "Join my call - Phone number input",
        locator: page.locator("#user_phone_number_number"),
      },
      joinMyCallExtInput: {
        description: "Join my call - Ext input",
        locator: page.locator("#user_phone_number_extension"),
      },
      joinMyCallNicknameInput: {
        description: "Join my call - Nickname input",
        locator: page.locator("#user_phone_number_nickname"),
      },
      callNowButton: {
        description: "Call now button",
        locator: page.getByRole("button", { name: /call now/i }),
      },
      joinCallToast: {
        description: "Join call toast (success or error after Call now)",
        locator: page.getByText(
          /oops[,]?\s*failed to make call|your notetaker is calling you now!|double check your number|joining the call/i
        ),
      },
      captureMeetingNowMenuItem: {
        description: "Capture meeting now menu item",
        locator: page
          .locator("#new-meeting-menu-content")
          .getByRole("menuitem", { name: /capture meeting now/i }),
      },
      capturePlayPauseButton: {
        description: "Capture flow play/pause button",
        locator: page
          .getByRole("button", { name: /play|pause/i })
          .or(page.locator('button[aria-label*="play" i], button[aria-label*="pause" i]'))
          .first(),
      },
      captureSubmitButton: {
        description: "Capture flow submit button",
        locator: page
          .getByRole("button", { name: /submit/i })
          .or(page.locator("#upload-form button[type='submit']"))
          .first(),
      },
      captureProcessingLabel: {
        description:
          "Processing state label after submit (excludes static 'Notes will appear after the meeting is captured' placeholder)",
        locator: page.getByText(
          /processing|generating notes|\bcapturing\b|transcrib|notes will appear after processing completes|notes will appear after processing/i
        ),
      },
      capturePostSubmitDoneButton: {
        description: "Capture flow Done button in dialog after submit",
        locator: page
          .getByRole("dialog")
          .getByRole("button", { name: /^done$/i })
          .last(),
      },
      capturePostSubmitViewButton: {
        description: "Capture flow View button after Done",
        locator: page
          .getByRole("dialog")
          .getByRole("button", { name: /^view$/i })
          .or(page.getByRole("dialog").getByRole("link", { name: /^view$/i }))
          .last(),
      },
      bookingWindowWeeklyMenuItem: {
        description: "Create a booking window menu item (clickable parent)",
        locator: page
          .locator("#new-meeting-menu-content")
          .getByRole("menuitem", { name: /create a booking window/i })
          .or(
            page
              .locator("#new-meeting-menu-content")
              .locator('[role="menuitem"], a[href], button, [class*="menu-item"], [class*="menuitem"]')
              .filter({ hasText: /create a booking window/i })
              .first()
          )
          .or(
            page
              .locator("#new-meeting-menu-content")
              .getByText(/create a booking window/i)
              .locator("xpath=ancestor::*[self::a or self::button or @role='menuitem' or contains(@class, 'menu')][1]")
          )
          .first(),
      },
      bookingWindowModal: {
        description: "Create booking window modal (bw_form_modal)",
        locator: page.locator("#bw_form_modal"),
      },
      bookingWindowNameInput: {
        description: "Booking window name input (inside modal)",
        locator: page.locator("#bw_form_modal").locator("input[type='text']").first(),
      },
      bookingWindowSubmitButton: {
        description: "Booking window Save / Create / Submit button (in modal)",
        locator: page
          .locator("#bw_form_modal")
          .getByRole("button", { name: /save|create|submit|add/i })
          .or(page.locator("#bw_form_modal").locator('button[type="submit"]'))
          .first(),
      },
      bookingWindowAvailabilityDropdown: {
        description: "Repeat type dropdown trigger (in modal)",
        locator: page.locator("#weekly_form_bw_repeat-trigger"),
      },
      bookingWindowVideoConferencingDropdownDoNotRepeat: {
        description: "Video Conferencing dropdown trigger (do not repeat form in modal)",
        locator: page.locator("#no_repeat_form_booking_window_conferencing-trigger"),
      },
      bookingWindowDaysAddButton: {
        description: "Saturday Add availability button (in modal)",
        locator: page.locator("#saturday-add-first-availability_weekly_form"),
      },
      bookingWindowDaysDeleteButton: {
        description: "Saturday Remove availability button (in modal)",
        locator: page.locator("#bw_form_modal").getByRole("button", { name: /remove.*saturday|saturday.*remove/i }).or(page.locator("#saturday-remove-availability-0_weekly_form")),
      },
      bookingWindowVideoConferencingDropdown: {
        description: "Video Conferencing dropdown trigger (weekly form in modal)",
        locator: page.locator("#weekly_form_booking_window_conferencing-trigger"),
      },
      bookingWindowDoneButton: {
        description: "Booking window Done button (in modal)",
        locator: page.locator("#bw_form_modal").getByRole("button", { name: /^done$/i }),
      },
      bookingWindowNoThanksButton: {
        description: "After booking window save: dismiss share / upsell (No thanks)",
        locator: page
          .getByRole("button", { name: /no thanks/i })
          .or(page.getByRole("link", { name: /no thanks/i }))
          .first(),
      },
      bookingWindowPostNoThanksCancelButton: {
        description: "After No thanks: Cancel in follow-up dialog (share / booking flow)",
        locator: page
          .getByRole("dialog")
          .getByRole("button", { name: /^cancel$/i })
          .last(),
      },
      shareBookingWindowModalCloseButton: {
        description: "Share Booking window modal Close button",
        locator: page
          .getByRole("dialog")
          .filter({ hasText: /share.*booking window|booking window/i })
          .getByRole("button", { name: /close/i })
          .or(page.getByRole("dialog").getByLabel(/close/i))
          .or(page.getByRole("dialog").locator('button[aria-label*="close" i]').first()),
      },
    };
  }

  async navigateToApp(baseUrl: string): Promise<void> {
    const url = baseUrl.replace(/\/$/, "");
    await this.playwrightActionsFactory.navigateToURL(url);
    await this.page.waitForLoadState("domcontentloaded", { timeout: 20000 });
    await this.playwrightActionsFactory.waitForSelector(
      this.locators.newMeetingBtn,
      20000,
      "visible"
    );
  }

  async navigateToMeetingPage(meetingUrl: string): Promise<void> {
    await this.playwrightActionsFactory.navigateToURL(meetingUrl);
    await this.page.waitForLoadState("domcontentloaded", { timeout: 20000 });
    if (this.page.url().toLowerCase().includes("/login")) {
      throw new Error("Meeting URL redirected to login. Run login spec once to save cookies (jumpapp-google-auth.json).");
    }
    await this.page.locator("#upload-form").waitFor({ state: "visible", timeout: 15000 });
  }

  async openNewMeetingMenu(): Promise<void> {
    await this.playwrightActionsFactory.click(this.locators.newMeetingBtn);
  }

  async clickUploadMeetingAudio(): Promise<void> {
    await this.playwrightActionsFactory.waitForSelector(
      this.locators.newMeetingMenuContent,
      20000,
      "visible"
    );
    await this.playwrightActionsFactory.click(this.locators.uploadMeetingAudioOption);
    await this.page.locator("#upload-form").waitFor({ state: "visible", timeout: 15000 });
  }

  async clickSendNotetakerToMeeting(): Promise<void> {
    await this.playwrightActionsFactory.waitForSelector(
      this.locators.newMeetingMenuContent,
      20000,
      "visible"
    );
    await this.playwrightActionsFactory.click(this.locators.sendNotetakerMenuItem);
    await this.page.waitForURL(/\/meetings\/send-to-meeting/, { timeout: 15000 });
    await this.locators.sendNotetakerFormUrl.locator.waitFor({ state: "visible", timeout: 10000 });
  }

  async sendNotetakerToMeeting(baseUrl: string, meetingUrl: string): Promise<void> {
    await this.navigateToApp(baseUrl);
    await this.openNewMeetingMenu();
    await this.clickSendNotetakerToMeeting();
    await this.playwrightActionsFactory.sendKeys(this.locators.sendNotetakerFormUrl, meetingUrl);
    const submitBtn = this.page.getByRole("button", { name: /send notetaker/i });
    await submitBtn.waitFor({ state: "visible", timeout: 10000 });
    await submitBtn.click({ timeout: 10000 });
    await this.waitForNotetakerToast(20000);
  }

  async waitForNotetakerToast(timeoutMs: number = 15000): Promise<void> {
    await this.locators.notetakerToast.locator.waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
    await expect(this.locators.notetakerToast.locator).toBeVisible();
  }

  async clickJoinMyCall(): Promise<void> {
    await this.playwrightActionsFactory.waitForSelector(
      this.locators.newMeetingMenuContent,
      20000,
      "visible"
    );
    await this.playwrightActionsFactory.click(this.locators.joinMyCallMenuItem);
  }

  async fillJoinMyCallForm(phoneNumber: string, ext: string, nickname: string): Promise<void> {
    await this.locators.joinMyCallPhoneInput.locator.waitFor({ state: "visible", timeout: 15000 });
    await this.playwrightActionsFactory.sendKeys(this.locators.joinMyCallPhoneInput, phoneNumber);
    await this.playwrightActionsFactory.sendKeys(this.locators.joinMyCallExtInput, ext);
    await this.playwrightActionsFactory.sendKeys(this.locators.joinMyCallNicknameInput, nickname);
  }

  async clickCallNow(): Promise<void> {
    await this.locators.callNowButton.locator.waitFor({ state: "visible", timeout: 15000 });
    await expect(this.locators.callNowButton.locator).toBeEnabled({ timeout: 10000 });
    await this.playwrightActionsFactory.click(this.locators.callNowButton);
  }

  /** Waits for join-call toast (success or error). Returns true if visible within timeout, false otherwise. */
  async waitForJoinCallToast(timeoutMs: number = 25000): Promise<boolean> {
    await this.playwrightActionsFactory.waitForSec(5);
    try {
      await this.locators.joinCallToast.locator.waitFor({
        state: "visible",
        timeout: timeoutMs,
      });
      return true;
    } catch {
      return false;
    }
  }

  /** New meeting → Join my call → fill form → Call now → wait for toast. Returns true if toast appeared. */
  async joinMyCallAndVerifyToast(
    baseUrl: string,
    phoneNumber: string,
    ext: string,
    nickname: string
  ): Promise<boolean> {
    await this.navigateToApp(baseUrl);
    await this.openNewMeetingMenu();
    await this.clickJoinMyCall();
    await this.fillJoinMyCallForm(phoneNumber, ext, nickname);
    await this.clickCallNow();
    return this.waitForJoinCallToast(25000);
  }

  async clickCaptureMeetingNow(): Promise<void> {
    await this.playwrightActionsFactory.waitForSelector(
      this.locators.newMeetingMenuContent,
      20000,
      "visible"
    );
    await this.playwrightActionsFactory.click(this.locators.captureMeetingNowMenuItem);
  }

  async waitForMeetingCapturedLabel(timeoutMs: number = 60000): Promise<void> {
    await this.locators.meetingCapturedLabel.locator.waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
  }

  async clickCapturePlayPause(): Promise<void> {
    await this.locators.capturePlayPauseButton.locator.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.playwrightActionsFactory.click(this.locators.capturePlayPauseButton);
  }

  async clickCaptureSubmit(): Promise<void> {
    await this.locators.captureSubmitButton.locator.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.playwrightActionsFactory.click(this.locators.captureSubmitButton);
  }

  async waitForCaptureProcessingLabel(timeoutMs: number = 60000): Promise<void> {
    await this.locators.captureProcessingLabel.locator
      .or(this.locators.meetingCapturedLabel.locator)
      .first()
      .waitFor({ state: "visible", timeout: timeoutMs });
  }

  /**
   * Grants microphone (avoids blocking on browser "Allow" prompt). Optional Done/View in post-submit dialog.
   */
  private async grantMicrophoneForOrigin(baseUrl: string): Promise<void> {
    const normalized = baseUrl.replace(/\/$/, "");
    try {
      const origin = new URL(normalized.startsWith("http") ? normalized : `https://${normalized}`).origin;
      await this.page.context().grantPermissions(["microphone"], { origin });
    } catch {
      /* invalid baseUrl — skip */
    }
  }

  /**
   * Clicks Done then View in the topmost dialog when shown after capture submit (no-op if absent).
   */
  async clickCapturePostSubmitDoneAndViewIfVisible(timeoutMs: number = 20000): Promise<void> {
    const done = this.locators.capturePostSubmitDoneButton.locator;
    try {
      await done.waitFor({ state: "visible", timeout: timeoutMs });
      await this.playwrightActionsFactory.click(this.locators.capturePostSubmitDoneButton);
    } catch {
      return;
    }
    const view = this.locators.capturePostSubmitViewButton.locator;
    try {
      await view.waitFor({ state: "visible", timeout: timeoutMs });
      await this.playwrightActionsFactory.click(this.locators.capturePostSubmitViewButton);
    } catch {
      /* View optional if UI skips it */
    }
  }

  /** New meeting → Capture meeting now → wait 10s → play/pause → submit → processing → Meeting captured. */
  async captureMeetingNowAndVerifyMeetingCaptured(baseUrl: string): Promise<void> {
    await this.navigateToApp(baseUrl);
    await this.grantMicrophoneForOrigin(this.page.url());
    await this.openNewMeetingMenu();
    await this.clickCaptureMeetingNow();
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await this.clickCapturePlayPause();
    await this.clickCaptureSubmit();
    await this.clickCapturePostSubmitDoneAndViewIfVisible(20000);
    await this.waitForCaptureProcessingLabel(90000);
    await this.waitForMeetingCapturedLabel(120000);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  async clickBookingWindowWeekly(): Promise<void> {
    await this.playwrightActionsFactory.waitForSelector(
      this.locators.newMeetingMenuContent,
      20000,
      "visible"
    );
    await this.playwrightActionsFactory.click(this.locators.bookingWindowWeeklyMenuItem);
  }

  async fillBookingWindowName(name: string): Promise<void> {
    await this.locators.bookingWindowModal.locator.waitFor({ state: "attached", timeout: 15000 });
    await this.locators.bookingWindowNameInput.locator.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.playwrightActionsFactory.sendKeys(this.locators.bookingWindowNameInput, name);
  }

  async clickBookingWindowSubmit(): Promise<void> {
    await this.locators.bookingWindowSubmitButton.locator.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.playwrightActionsFactory.click(this.locators.bookingWindowSubmitButton);
  }

  async selectBookingWindowAvailabilityRepeatWeekly(): Promise<void> {
    await this.locators.bookingWindowAvailabilityDropdown.locator.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.locators.bookingWindowAvailabilityDropdown.locator.click();
    await this.page
      .getByRole("option", { name: /repeat weekly/i })
      .or(this.page.locator("[role='option']").filter({ hasText: /repeat weekly/i }).first())
      .click({ timeout: 10000 });
  }

  async selectBookingWindowAvailabilityDoNotRepeat(): Promise<void> {
    await this.locators.bookingWindowAvailabilityDropdown.locator.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.locators.bookingWindowAvailabilityDropdown.locator.click();
    await this.page
      .getByRole("option", { name: /do not repeat|don't repeat|no repeat/i })
      .or(this.page.locator("[role='option']").filter({ hasText: /do not repeat|don't repeat|no repeat/i }).first())
      .click({ timeout: 10000 });
  }

  async selectBookingWindowVideoConferencingGoogleDoNotRepeat(): Promise<void> {
    await this.locators.bookingWindowVideoConferencingDropdownDoNotRepeat.locator.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.locators.bookingWindowVideoConferencingDropdownDoNotRepeat.locator.click();
    const googleOption = this.page.getByRole("option", { name: /google/i }).first();
    await googleOption.waitFor({ state: "visible", timeout: 10000 });
    await googleOption.click();
  }

  async clickBookingWindowDaysAdd(): Promise<void> {
    await this.locators.bookingWindowDaysAddButton.locator.waitFor({
      state: "visible",
      timeout: 10000,
    });
    await this.playwrightActionsFactory.click({
      description: this.locators.bookingWindowDaysAddButton.description,
      locator: this.locators.bookingWindowDaysAddButton.locator,
    });
    await this.playwrightActionsFactory.waitForSec(1);
  }

  async clickBookingWindowDaysDelete(): Promise<void> {
    const removeBtn = this.locators.bookingWindowDaysDeleteButton.locator;
    try {
      await removeBtn.waitFor({ state: "visible", timeout: 10000 });
      await this.playwrightActionsFactory.click({
        description: this.locators.bookingWindowDaysDeleteButton.description,
        locator: removeBtn,
      });
    } catch {
      // Remove button not present (e.g. slot not created until times are set); continue
    }
  }

  async selectBookingWindowVideoConferencingGoogle(): Promise<void> {
    await this.locators.bookingWindowVideoConferencingDropdown.locator.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.locators.bookingWindowVideoConferencingDropdown.locator.click();
    const googleOption = this.page.getByRole("option", { name: /google/i }).first();
    await googleOption.waitFor({ state: "visible", timeout: 10000 });
    await googleOption.click();
  }

  async clickBookingWindowDone(): Promise<void> {
    await this.locators.bookingWindowDoneButton.locator.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await expect(this.locators.bookingWindowDoneButton.locator).toBeEnabled({ timeout: 15000 });
    await this.playwrightActionsFactory.click(this.locators.bookingWindowDoneButton);
  }

  /**
   * Clicks Cancel when a second dialog appears after "No thanks" (optional; no-op if absent).
   */
  async clickBookingWindowPostNoThanksCancelIfVisible(timeoutMs: number = 15000): Promise<void> {
    const cancel = this.locators.bookingWindowPostNoThanksCancelButton.locator;
    try {
      await cancel.waitFor({ state: "visible", timeout: timeoutMs });
      await this.playwrightActionsFactory.click(this.locators.bookingWindowPostNoThanksCancelButton);
      await this.playwrightActionsFactory.waitForSec(1);
    } catch {
      /* follow-up not shown on all builds */
    }
  }

  async clickShareBookingWindowModalClose(): Promise<void> {
    const bookingFormModal = this.page.locator("#bw_form_modal");
    try {
      await bookingFormModal.waitFor({ state: "hidden", timeout: 15000 });
    } catch {
      await bookingFormModal.waitFor({ state: "detached", timeout: 5000 });
    }
    const noThanks = this.locators.bookingWindowNoThanksButton.locator;
    const shareDialog = this.page.locator("#share_modal");
    await noThanks.or(shareDialog).waitFor({ state: "visible", timeout: 20000 });

    if (await noThanks.isVisible()) {
      await this.playwrightActionsFactory.click(this.locators.bookingWindowNoThanksButton);
      await this.playwrightActionsFactory.waitForSec(1);
      await this.clickBookingWindowPostNoThanksCancelIfVisible();
      return;
    }

    await shareDialog.waitFor({ state: "attached", timeout: 5000 });
    const closeBtn = shareDialog.getByRole("button", { name: /close|cancel/i }).nth(1);
    const closeVisible = await closeBtn.waitFor({ state: "visible", timeout: 15000 }).then(() => true).catch(() => false);
    if (closeVisible) {
      await closeBtn.click({ timeout: 10000 });
      await this.playwrightActionsFactory.waitForSec(5);
    } else {
      await this.playwrightActionsFactory.waitForSec(2);
      await closeBtn.click({ force: true, timeout: 10000 });
    }
    try {
      await shareDialog.waitFor({ state: "hidden", timeout: 10000 });
    } catch {
      await shareDialog.waitFor({ state: "detached", timeout: 5000 });
    }
  }

  /** New meeting → Booking window Weekly → name → Availability Repeat Weekly → Saturday Add/Delete/Add → Video Conferencing Google → Done → Close share modal. */
  async createBookingWindowWeekly(baseUrl: string, bookingWindowName: string): Promise<void> {
    await this.navigateToApp(baseUrl);
    await this.openNewMeetingMenu();
    await this.clickBookingWindowWeekly();
    await this.fillBookingWindowName(bookingWindowName);
    await this.selectBookingWindowAvailabilityRepeatWeekly();
    await this.clickBookingWindowDaysAdd();
    await this.clickBookingWindowDaysDelete();
    await this.clickBookingWindowDaysAdd();
    await this.selectBookingWindowVideoConferencingGoogle();
    await this.clickBookingWindowDone();
    await this.clickShareBookingWindowModalClose();
  }

  /** New meeting → Booking window → name → Availability Do not repeat → Video Conferencing Google → Done → Close share modal. */
  async createBookingWindowDoNotRepeat(baseUrl: string, bookingWindowName: string): Promise<void> {
    await this.navigateToApp(baseUrl);
    await this.openNewMeetingMenu();
    await this.clickBookingWindowWeekly();
    await this.fillBookingWindowName(bookingWindowName);
    await this.selectBookingWindowAvailabilityDoNotRepeat();
    await this.selectBookingWindowVideoConferencingGoogleDoNotRepeat();
    await this.clickBookingWindowDone();
    await this.clickShareBookingWindowModalClose();
  }

  async uploadMeetingAudioFile(filePathOrName: string): Promise<void> {
    const hasDirectory = /[/\\]/.test(filePathOrName);
    const resolvedPath = path.isAbsolute(filePathOrName)
      ? filePathOrName
      : hasDirectory
        ? path.resolve(process.cwd(), filePathOrName)
        : path.resolve(process.cwd(), "src", "fixtures", "audio", filePathOrName);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Upload file not found: ${resolvedPath}`);
    }

    const form = this.page.locator("#upload-form");
    await form.waitFor({ state: "visible", timeout: 15000 });
    await this.locators.uploadFormFileInput.locator.waitFor({
      state: "attached",
      timeout: 10000,
    });

    await this.playwrightActionsFactory.setInputFiles(
      this.locators.uploadFormFileInput,
      resolvedPath
    );
  }

  async submitUploadIfVisible(timeoutMs: number = 10000): Promise<void> {
    const form = this.page.locator("#upload-form");
    const primaryAction = this.locators.submitUploadBtn.locator
      .or(form.getByRole("button", { name: /\b(upload|submit)\b/i }))
      .or(form.locator("button[type='submit']"))
      .first();
    try {
      await primaryAction.waitFor({ state: "visible", timeout: timeoutMs });
      await primaryAction.click();
    } catch {
      // No explicit submit; upload may start automatically after file selection
    }
  }

  async waitForMeetingCaptured(timeoutMs: number = 60000): Promise<void> {
    await this.locators.meetingCapturedLabel.locator.waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
  }

  async waitForUploadFinish(timeoutMs: number = 120000): Promise<void> {
    await this.locators.uploadingAudioStatus.locator.waitFor({
      state: "hidden",
      timeout: timeoutMs,
    });
  }

  async waitForNotesGeneration(timeoutVisible: number = 60000, timeoutDetached: number = 240000): Promise<void> {
    const generating = this.page
      .getByText(/Notes will appear after processing completes\.?/i)
      .or(this.page.getByText(/notes will appear after the meeting is captured/i))
      .or(this.page.getByText(/processing completes|generating notes/i));
    await generating.first().waitFor({ state: "visible", timeout: timeoutVisible });
    await generating.first().waitFor({ state: "detached", timeout: timeoutDetached });
  }

  async createMeetingWithUploadedAudio(
    baseUrl: string,
    filePath: string,
    meetingUrl?: string
  ): Promise<void> {
    if (meetingUrl) {
      await this.navigateToMeetingPage(meetingUrl);
    } else {
      await this.navigateToApp(baseUrl);
      await this.openNewMeetingMenu();
      await this.clickUploadMeetingAudio();
    }
    await this.uploadMeetingAudioFile(filePath);
    await this.submitUploadIfVisible(15000);

    const uploadStarted = await this.locators.uploadingAudioStatus.locator
      .waitFor({ state: "visible", timeout: 30000 })
      .then(() => true)
      .catch(() => false);

    if (!uploadStarted) {
      const selectFileStillVisible = await this.page
        .getByText("Select file", { exact: true })
        .isVisible()
        .catch(() => true);
      if (selectFileStillVisible) {
        throw new Error(
          "Upload did not start (no 'Uploading audio' within 30s; 'Select file' still visible)."
        );
      }
    }

    await this.waitForUploadFinish(120000);
    await this.waitForMeetingCaptured(30000);

    try {
      await this.waitForNotesGeneration(60000, 240000);
    } catch {
      await this.locators.notesPlaceholder.locator
        .waitFor({ state: "hidden", timeout: 120000 })
        .catch(() => {
          throw new Error("Notes did not finish generating.");
        });
    }
  }
}
