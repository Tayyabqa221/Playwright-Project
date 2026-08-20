import { ContactsTestCaseData } from "@interfaces/contacts/contacts.interface";
import { getEnvVariable } from "@utilities/env.utils";

const contactsTestData: { [key: string]: ContactsTestCaseData } = {
  "contacts-create-and-search": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @contacts @createContact",
      testCase: "TC-JUMPAPP-020",
      testDescription: "Create a contact with random name/email, then search and verify created contact.",
      testSummary: "Open contacts, create contact with faker data, search that contact, verify exact name in results.",
    },
    createContact: {
      emailDomain: "jumpapp.test",
    },
  },
  "contacts-edit-contact": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @contacts @editContact",
      testCase: "TC-JUMPAPP-021",
      testDescription: "Create a contact, open it, edit name and email, then search by edited email and verify.",
      testSummary: "Open contacts, create contact, search/open contact, edit details, search with edited email, verify edited contact.",
    },
    createContact: {
      emailDomain: "jumpapp.test",
    },
  },
  "contacts-edit-and-delete-contact": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @contacts @editContact @deleteContact",
      testCase: "TC-JUMPAPP-022",
      testDescription:
        "Create a contact, edit name and email, open edited contact, delete it from three-dot menu, and verify delete toast.",
      testSummary:
        "Open contacts, create and edit contact, open edited record, delete via 3-dots, verify contact deleted toast message.",
    },
    createContact: {
      emailDomain: "jumpapp.test",
    },
  },
  "contacts-upload-document": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @contacts @uploadDocument",
      testCase: "TC-JUMPAPP-023",
      testDescription: "Create a contact, open it by email search, upload a document, and verify uploaded document name.",
      testSummary: "Open contacts, create contact, search/open by email, upload sample document, verify uploaded file name.",
    },
    createContact: {
      emailDomain: "jumpapp.test",
    },
    uploadDocument: {
      filePath: "src/data/test-files/contact-document.txt",
      expectedFileName: "contact-document.txt",
    },
  },
  "contacts-past-meetings-tabs-and-meeting-prep": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @contacts @pastMeetings @meetingPrep",
      testCase: "TC-JUMPAPP-024",
      testDescription:
        "Create a contact, search by email and open it, visit every Past meetings tab (Upcoming, All past, AI-processed, Needs Action), then open Meeting prep and verify prep UI.",
      testSummary:
        "Contacts: create → search by email → open detail → cycle all Past meetings filters → Meeting prep visible.",
    },
    createContact: {
      emailDomain: "jumpapp.test",
    },
  },
  "contacts-create-and-open-meeting-prep": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @contacts @createContact @meetingPrep",
      testCase: "TC-JUMPAPP-025",
      testDescription:
        "Create a contact, search by email and open the contact detail, then open Pre-meeting prep and verify the prep section is visible.",
      testSummary: "Contacts: create contact → search by email → open detail → navigate to Meeting prep → verify prep UI.",
    },
    createContact: {
      emailDomain: "jumpapp.test",
    },
  },
  "contacts-sort-by-a-z-and-z-a": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @contacts @sort",
      testCase: "TC-JUMPAPP-026",
      testDescription: "Open Contacts and apply name sorting from A-Z, then switch sorting to Z-A.",
      testSummary: "Contacts: navigate to module, apply A-Z sort, then apply Z-A sort.",
    },
    createContact: {
      emailDomain: "jumpapp.test",
    },
  },
  "contacts-upload-and-download-document": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    testCaseData: {
      tags: "@smoke @contacts @uploadDocument @downloadDocument",
      testCase: "TC-JUMPAPP-027",
      testDescription:
        "Create a contact, search and open it, upload a document, then download that uploaded document.",
      testSummary:
        "Contacts: create contact, search/open by email, upload sample document, download same document from contact panel.",
    },
    createContact: {
      emailDomain: "jumpapp.test",
    },
    uploadDocument: {
      filePath: "src/data/test-files/contact-document.txt",
      expectedFileName: "contact-document.txt",
      expectedDownloadedFileName: "contact-document.txt",
    },
  },
};

export function getData(testCase: string): ContactsTestCaseData {
  const data = contactsTestData[testCase];
  if (!data) {
    throw new Error(`Test case data not found for: ${testCase}. Add data in data/contacts/contacts.data.ts`);
  }
  return data;
}
