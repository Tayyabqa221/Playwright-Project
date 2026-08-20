import { test as base, BrowserContext, Page } from "@playwright/test";
import { LoginPage } from "@page/login/login.page";
import { MeetingsPage } from "@page/modules/meetings.page";
import { ActionsPage } from "@page/modules/actions.page";
import { ContactsPage } from "@page/contacts/contacts.page";
import { DocumentPage } from "@page/document/document.page";
import { MeetingPrepPage } from "@page/Template/meetingPrep.page";
import { MeetingNotesPage } from "@page/Template/meetingNotes.page";
import { AgendaPage } from "@page/Template/agenda.page";
import { HomePage } from "@page/modules/home.page";
import { NewMeetingPage } from "../page/modules/newMeeting.page";

type TestFixtures = {
  browserContext: BrowserContext;
  userContext: Page;
  loginPage: LoginPage;
  meetingsPage: MeetingsPage;
  actionsPage: ActionsPage;
  contactsPage: ContactsPage;
  documentPage: DocumentPage;
  meetingPrepPage: MeetingPrepPage;
  meetingNotesPage: MeetingNotesPage;
  agendaPage: AgendaPage;
  homePage: HomePage;
  newMeetingPage: NewMeetingPage;
};

export const test = base.extend<TestFixtures>({
  browserContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    try {
      await use(context);
    } finally {
      await context.close();
    }
  },
  userContext: async ({ browserContext }, use) => {
    const userPage = await browserContext.newPage();
    try {
      await use(userPage);
    } finally {
      await userPage.close();
    }
  },
  loginPage: async (
    { userContext }: { userContext: Page },
    use: (r: LoginPage) => Promise<void>,
    testInfo: import("@playwright/test").TestInfo
  ) => {
    await use(new LoginPage(userContext, testInfo));
  },
  meetingsPage: async (
    { userContext }: { userContext: Page },
    use: (r: MeetingsPage) => Promise<void>,
    testInfo: import("@playwright/test").TestInfo
  ) => {
    await use(new MeetingsPage(userContext, testInfo));
  },
  actionsPage: async (
    { userContext }: { userContext: Page },
    use: (r: ActionsPage) => Promise<void>,
    testInfo: import("@playwright/test").TestInfo
  ) => {
    await use(new ActionsPage(userContext, testInfo));
  },
  contactsPage: async (
    { userContext }: { userContext: Page },
    use: (r: ContactsPage) => Promise<void>,
    testInfo: import("@playwright/test").TestInfo
  ) => {
    await use(new ContactsPage(userContext, testInfo));
  },
  documentPage: async (
    { userContext }: { userContext: Page },
    use: (r: DocumentPage) => Promise<void>,
    testInfo: import("@playwright/test").TestInfo
  ) => {
    await use(new DocumentPage(userContext, testInfo));
  },
  meetingPrepPage: async (
    { userContext }: { userContext: Page },
    use: (r: MeetingPrepPage) => Promise<void>,
    testInfo: import("@playwright/test").TestInfo
  ) => {
    await use(new MeetingPrepPage(userContext, testInfo));
  },
  meetingNotesPage: async (
    { userContext }: { userContext: Page },
    use: (r: MeetingNotesPage) => Promise<void>,
    testInfo: import("@playwright/test").TestInfo
  ) => {
    await use(new MeetingNotesPage(userContext, testInfo));
  },
  agendaPage: async (
    { userContext }: { userContext: Page },
    use: (r: AgendaPage) => Promise<void>,
    testInfo: import("@playwright/test").TestInfo
  ) => {
    await use(new AgendaPage(userContext, testInfo));
  },
  homePage: async (
    { userContext }: { userContext: Page },
    use: (r: HomePage) => Promise<void>,
    testInfo: import("@playwright/test").TestInfo
  ) => {
    await use(new HomePage(userContext, testInfo));
  },
  newMeetingPage: async (
    { userContext }: { userContext: Page },
    use: (r: NewMeetingPage) => Promise<void>,
    testInfo: import("@playwright/test").TestInfo
  ) => {
    await use(new NewMeetingPage(userContext, testInfo));
  },
});

export { test as pageTest };
