import { test } from "@fixtures/mergePage.fixture";
import { faker } from "@faker-js/faker";
import { getDataSet } from "@utilities/env.utils";
import { getStorageStatePath } from "@utilities/storage.state.utils";
import { logTestCaseData } from "@utilities/test.helper.utils";

const scenario = getDataSet("contacts", "contactsTestData", "contacts-create-and-search");
const editScenario = getDataSet("contacts", "contactsTestData", "contacts-edit-contact");
const editAndDeleteScenario = getDataSet("contacts", "contactsTestData", "contacts-edit-and-delete-contact");
const uploadDocumentScenario = getDataSet("contacts", "contactsTestData", "contacts-upload-document");
const pastMeetingsAndPrepScenario = getDataSet(
  "contacts",
  "contactsTestData",
  "contacts-past-meetings-tabs-and-meeting-prep"
);
const createAndMeetingPrepScenario = getDataSet(
  "contacts",
  "contactsTestData",
  "contacts-create-and-open-meeting-prep"
);
const sortContactsScenario = getDataSet("contacts", "contactsTestData", "contacts-sort-by-a-z-and-z-a");
const uploadAndDownloadDocumentScenario = getDataSet(
  "contacts",
  "contactsTestData",
  "contacts-upload-and-download-document"
);
test.use({ storageState: getStorageStatePath("jumpappGoogle") });
test.describe("Contacts", () => {
  test.describe.configure({ mode: "serial" });

  test(
    `
      Test case: '${scenario.testCaseData.testCase}'
      Summary: ${scenario.testCaseData.testSummary}
      Description: ${scenario.testCaseData.testDescription}
      Tags: '${scenario.testCaseData.tags}'
    `,
    async ({ contactsPage }) => {
      await logTestCaseData(test.info(), scenario.testCaseData);
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const emailPrefix = faker.string.alphanumeric(10).toLowerCase();
      const email = `${emailPrefix}@${scenario.createContact.emailDomain}`;

      await test.step("Create a contact with random first name, last name, and email", async () => {
        await contactsPage.navigateToContacts(scenario.baseUrl);
        await contactsPage.createContact(firstName, lastName, email);
      });

      await test.step("Click on Contacts module again", async () => {
        await contactsPage.clickContactsModuleAgain();
      });

      await test.step("Click filter by meeting name", async () => {
        await contactsPage.clickFilterByMeetingName();
      });

      await test.step("Search created contact by email", async () => {
        await contactsPage.searchContact(email);
      });

      await test.step("Verify created contact by email in search results", async () => {
        await contactsPage.verifyContactByEmailInSearchResults(email);
      });
    }
  );

  test(
    `
      Test case: '${editScenario.testCaseData.testCase}'
      Summary: ${editScenario.testCaseData.testSummary}
      Description: ${editScenario.testCaseData.testDescription}
      Tags: '${editScenario.testCaseData.tags}'
    `,
    async ({ contactsPage }) => {
      await logTestCaseData(test.info(), editScenario.testCaseData);
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = `${faker.string.alphanumeric(10).toLowerCase()}@${editScenario.createContact.emailDomain}`;
      const updatedFirstName = faker.person.firstName();
      const updatedLastName = faker.person.lastName();
      const updatedEmail = `${faker.string.alphanumeric(10).toLowerCase()}@${editScenario.createContact.emailDomain}`;
      const searchContact = async (contactEmail: string): Promise<void> => {
        await contactsPage.clickContactsModuleAgain();
        await contactsPage.clickFilterByMeetingName();
        await contactsPage.searchContact(contactEmail);
      };

      await test.step("Go to contact and create a new contact", async () => {
        await contactsPage.navigateToContacts(editScenario.baseUrl);
        await contactsPage.createContact(firstName, lastName, email);
      });

      await test.step("Search the created contact and open it", async () => {
        await searchContact(email);
        await contactsPage.openContactFromSearchResults(email);
      });

      await test.step("Edit the contact name and email", async () => {
        await contactsPage.editOpenedContact(updatedFirstName, updatedLastName, updatedEmail);
      });

      await test.step("Search again with edited created email and verify edited contact email", async () => {
        await searchContact(updatedEmail);
        await contactsPage.verifyContactByEmailInSearchResults(updatedEmail);
      });
    }
  );

  test(
    `
      Test case: '${editAndDeleteScenario.testCaseData.testCase}'
      Summary: ${editAndDeleteScenario.testCaseData.testSummary}
      Description: ${editAndDeleteScenario.testCaseData.testDescription}
      Tags: '${editAndDeleteScenario.testCaseData.tags}'
    `,
    async ({ contactsPage }) => {
      await logTestCaseData(test.info(), editAndDeleteScenario.testCaseData);
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = `${faker.string.alphanumeric(10).toLowerCase()}@${editAndDeleteScenario.createContact.emailDomain}`;
      const updatedFirstName = faker.person.firstName();
      const updatedLastName = faker.person.lastName();
      const updatedFullName = `${updatedFirstName} ${updatedLastName}`;
      const updatedEmail = `${faker.string.alphanumeric(10).toLowerCase()}@${editAndDeleteScenario.createContact.emailDomain}`;
      const searchContact = async (contactValue: string): Promise<void> => {
        await contactsPage.clickContactsModuleAgain();
        await contactsPage.clickFilterByMeetingName();
        await contactsPage.searchContact(contactValue);
      };

      await test.step("Go to contacts and create a new contact", async () => {
        await contactsPage.navigateToContacts(editAndDeleteScenario.baseUrl);
        await contactsPage.createContact(firstName, lastName, email);
      });

      await test.step("Search created contact and open it", async () => {
        await searchContact(email);
        await contactsPage.openContactFromSearchResults(email);
      });

      await test.step("Edit contact name and email", async () => {
        await contactsPage.editOpenedContact(updatedFirstName, updatedLastName, updatedEmail);
      });

      await test.step("Open edited contact by updated name", async () => {
        await searchContact(updatedFullName);
        await contactsPage.openContactFromSearchResults(updatedFullName);
      });

      await test.step("Click 3-dots and delete contact", async () => {
        await contactsPage.deleteOpenedContactFromThreeDot();
      });

      await test.step("Verify contact deleted toast message", async () => {
        await contactsPage.verifyContactDeletedToast();
      });
    }
  );

  test(
    `
      Test case: '${pastMeetingsAndPrepScenario.testCaseData.testCase}'
      Summary: ${pastMeetingsAndPrepScenario.testCaseData.testSummary}
      Description: ${pastMeetingsAndPrepScenario.testCaseData.testDescription}
      Tags: '${pastMeetingsAndPrepScenario.testCaseData.tags}'
    `,
    async ({ contactsPage }) => {
      await logTestCaseData(test.info(), pastMeetingsAndPrepScenario.testCaseData);
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = `${faker.string.alphanumeric(10).toLowerCase()}@${pastMeetingsAndPrepScenario.createContact.emailDomain}`;

      await test.step("Create contact", async () => {
        await contactsPage.navigateToContacts(pastMeetingsAndPrepScenario.baseUrl);
        await contactsPage.createContact(firstName, lastName, email);
      });

      await test.step("Search by email and open contact", async () => {
        await contactsPage.clickContactsModuleAgain();
        await contactsPage.clickFilterByMeetingName();
        await contactsPage.searchContact(email);
        await contactsPage.openContactFromSearchResults(email);
      });

      await test.step("Past meetings: visit Upcoming, All past, AI-processed, Needs Action (each tab selected)", async () => {
        await contactsPage.runContactPastMeetingsTabsFlow();
      });

      await test.step("Open Meeting prep and verify section", async () => {
        await contactsPage.clickMeetingPrepInContactPanel();
        await contactsPage.verifyMeetingPrepSectionVisibleInContactPanel();
      });
    }
  );

  test(
    `
      Test case: '${createAndMeetingPrepScenario.testCaseData.testCase}'
      Summary: ${createAndMeetingPrepScenario.testCaseData.testSummary}
      Description: ${createAndMeetingPrepScenario.testCaseData.testDescription}
      Tags: '${createAndMeetingPrepScenario.testCaseData.tags}'
    `,
    async ({ contactsPage }) => {
      await logTestCaseData(test.info(), createAndMeetingPrepScenario.testCaseData);
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = `${faker.string.alphanumeric(10).toLowerCase()}@${createAndMeetingPrepScenario.createContact.emailDomain}`;

      await test.step("Create a contact", async () => {
        await contactsPage.navigateToContacts(createAndMeetingPrepScenario.baseUrl);
        await contactsPage.createContact(firstName, lastName, email);
      });

      await test.step("Search by email, open contact, go to Pre-meeting prep", async () => {
        await contactsPage.clickContactsModuleAgain();
        await contactsPage.clickFilterByMeetingName();
        await contactsPage.searchContact(email);
        await contactsPage.openContactFromSearchResults(email);
        await contactsPage.clickMeetingPrepInContactPanel();
      });

      await test.step("Verify Pre-meeting prep section is visible", async () => {
        await contactsPage.verifyMeetingPrepSectionVisibleInContactPanel();
      });
    }
  );

  test(
    `
      Test case: '${sortContactsScenario.testCaseData.testCase}'
      Summary: ${sortContactsScenario.testCaseData.testSummary}
      Description: ${sortContactsScenario.testCaseData.testDescription}
      Tags: '${sortContactsScenario.testCaseData.tags}'
    `,
    async ({ contactsPage }) => {
      await logTestCaseData(test.info(), sortContactsScenario.testCaseData);

      await test.step("Open Contacts module", async () => {
        await contactsPage.navigateToContacts(sortContactsScenario.baseUrl);
      });

      await test.step("Sort contacts by Z-A", async () => {
        await contactsPage.sortContactsByName("z-a");
      });

      await test.step("Sort contacts by A-Z", async () => {
        await contactsPage.sortContactsByName("a-z");
      });
    }
  );

  test(
    `
      Test case: '${uploadAndDownloadDocumentScenario.testCaseData.testCase}'
      Summary: ${uploadAndDownloadDocumentScenario.testCaseData.testSummary}
      Description: ${uploadAndDownloadDocumentScenario.testCaseData.testDescription}
      Tags: '${uploadAndDownloadDocumentScenario.testCaseData.tags}'
    `,
    async ({ contactsPage }) => {
      await logTestCaseData(test.info(), uploadAndDownloadDocumentScenario.testCaseData);
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = `${faker.string.alphanumeric(10).toLowerCase()}@${uploadAndDownloadDocumentScenario.createContact.emailDomain}`;
      const uploadDocumentData = uploadAndDownloadDocumentScenario.uploadDocument;

      if (!uploadDocumentData) {
        throw new Error("Upload/download document test data is missing. Add uploadDocument in contacts data.");
      }

      await test.step("Create a new contact", async () => {
        await contactsPage.navigateToContacts(uploadAndDownloadDocumentScenario.baseUrl);
        await contactsPage.createContact(firstName, lastName, email);
      });

      await test.step("Search with email and open the contact", async () => {
        await contactsPage.clickContactsModuleAgain();
        await contactsPage.clickFilterByMeetingName();
        await contactsPage.searchContact(email);
        await contactsPage.openContactFromSearchResults(email);
      });

      await test.step("Upload a document", async () => {
        await contactsPage.uploadDocumentInOpenedContact(uploadDocumentData.filePath);
      });

      await test.step("Verify uploaded document is visible", async () => {
        await contactsPage.verifyUploadedDocumentName(uploadDocumentData.expectedFileName);
      });

      await test.step("Download uploaded document", async () => {
        const expectedDownloadedFileName = uploadDocumentData.expectedDownloadedFileName ?? uploadDocumentData.expectedFileName;
        await contactsPage.downloadUploadedDocument(expectedDownloadedFileName);
      });
    }
  );

  test(
    `
      Test case: '${uploadDocumentScenario.testCaseData.testCase}'
      Summary: ${uploadDocumentScenario.testCaseData.testSummary}
      Description: ${uploadDocumentScenario.testCaseData.testDescription}
      Tags: '${uploadDocumentScenario.testCaseData.tags}'
    `,
    async ({ contactsPage }) => {
      await logTestCaseData(test.info(), uploadDocumentScenario.testCaseData);
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = `${faker.string.alphanumeric(10).toLowerCase()}@${uploadDocumentScenario.createContact.emailDomain}`;
      const uploadDocumentData = uploadDocumentScenario.uploadDocument;

      if (!uploadDocumentData) {
        throw new Error("Upload document test data is missing. Add uploadDocument in contacts data.");
      }

      await test.step("Create a new contact", async () => {
        await contactsPage.navigateToContacts(uploadDocumentScenario.baseUrl);
        await contactsPage.createContact(firstName, lastName, email);
      });

      await test.step("Search with email and open the contact", async () => {
        await contactsPage.clickContactsModuleAgain();
        await contactsPage.clickFilterByMeetingName();
        await contactsPage.searchContact(email);
        await contactsPage.openContactFromSearchResults(email);
      });

      await test.step("Upload a document", async () => {
        await contactsPage.uploadDocumentInOpenedContact(uploadDocumentData.filePath);
      });

      await test.step("Verify the name of uploaded document", async () => {
        await contactsPage.verifyUploadedDocumentName(uploadDocumentData.expectedFileName);
      });
    }
  );
});
