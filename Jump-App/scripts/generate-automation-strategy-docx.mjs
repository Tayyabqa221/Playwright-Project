/**
 * Generates docs/Jump_App_automation_strategy.docx (English automation strategy).
 * Run: node scripts/generate-automation-strategy-docx.mjs
 */
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "docs", "Jump_App_automation_strategy.docx");

function title(text) {
  return new Paragraph({ text, heading: HeadingLevel.TITLE, spacing: { after: 200 } });
}

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 120 } });
}

function p(text) {
  return new Paragraph({ text, spacing: { after: 120 } });
}

function italicLine(text) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, italics: true })],
  });
}

function boldLine(text) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, bold: true })],
  });
}

function bullet(text) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 60 } });
}

function codeP(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, font: "Consolas", size: 20 })],
  });
}

const repoTree = `src/
├── config/              # Environment files (e.g. .env.staging — local, not committed)
├── cookies/             # Storage state for authenticated sessions
├── data/
│   ├── login/
│   └── modules/         # Per-feature test data (*.data.ts); optional NODE_ENV subfolders
├── fixtures/            # Playwright fixtures (page objects injected into tests)
├── interfaces/          # TypeScript interfaces
├── page/
│   ├── login/
│   └── modules/         # Page objects (POM) per feature
├── specs/
│   ├── login/
│   └── modules/         # Test specifications (*.spec.ts)
└── utilities/           # env, actions, verifications, mailosaur, global setup/teardown, etc.`;

const children = [
  title("Automation for Jump App"),

  h1("Introduction"),
  p(
    "The Jump App automation initiative focuses on automating regression and functional end-to-end testing for the Jump App web application to improve release reliability, reduce manual testing effort, and ensure consistent validation of critical user journeys across environments.",
  ),
  p(
    "The automation framework is built using Playwright with TypeScript and follows a Page Object Model (POM). It validates core product areas such as authentication, home, meetings, new meeting and notetaker-related flows, actions, and contacts through UI-based automation, with structured test data and reporting.",
  ),

  h1("1. Epic Overview"),
  p(
    "Automate regression and functional end-to-end testing for Jump App to improve release reliability, reduce manual regression effort, and provide repeatable validation of key workflows before and after releases.",
  ),
  p(
    "The initiative delivers automated test suites aligned with Jump App modules so teams can run smoke and broader regression packs on demand or from CI/CD.",
  ),

  h1("2. Objectives"),
  bullet("Ensure critical Jump App flows are automatically validated on each relevant build or scheduled run."),
  bullet("Detect UI and workflow defects earlier in the development lifecycle."),
  bullet("Reduce manual regression testing effort for recurring scenarios."),
  bullet("Support stable and faster releases through repeatable automated checks."),
  bullet("Provide consistent validation of meetings, contacts, actions, home, and login-related journeys."),
  bullet("Improve overall quality and reliability of customer-facing features."),

  h1("3. Scope"),
  italicLine("In scope (end-to-end):"),
  bullet("Login and authentication (including Google sign-in and 2FA/TOTP where configured)."),
  bullet("Logout."),
  bullet("Home dashboard and navigation."),
  bullet(
    "Meetings (list/calendar views, toggles, calendar settings, navigation, day range, tabs, filters, meeting actions such as remove, make private, and type selection, as covered in specs).",
  ),
  bullet("New meeting flows covered by the newMeeting module (including dynamic data via Faker where used)."),
  bullet("Actions module scenarios covered in automation."),
  bullet("Contacts module scenarios covered in automation."),
  bullet(
    "Cross-cutting concerns: stable locators (data-testid, aria-label, text where appropriate), traces, video, and screenshots on failure per Playwright configuration.",
  ),
  italicLine("Out of scope:"),
  bullet(
    "Dedicated API-only test suite (API clients may be used as helpers; contract/API testing is not the primary layer).",
  ),
  bullet("Performance and load testing."),
  bullet("Security penetration testing."),
  bullet("Applications or modules outside Jump App."),
  bullet("Database-level validations unless explicitly added as a future enhancement."),
  bullet("Large-scale data volume or soak testing unless separately planned."),

  h1("4. Automation Strategy"),
  p(
    "The automation approach aligns with the testing pyramid: fast feedback from developers’ unit tests, with UI end-to-end tests as the primary packaged automation for Jump App.",
  ),
  bullet("Test levels:"),
  bullet("Unit tests — owned by development."),
  bullet("API tests — optional future layer; not the current primary focus."),
  bullet("UI end-to-end tests — primary automation layer (Playwright, Chromium project)."),
  bullet(
    "Regression suite — tagged scenarios (e.g. @smoke, @regression via npm scripts and grep) to validate critical workflows across releases.",
  ),
  p(
    "Future: integrate runs with CI/CD (pull request checks, nightly regression, pre-release validation) using the same npm and Playwright commands.",
  ),

  h1("5. Tools and Technology Stack"),
  italicLine("UI automation"),
  bullet("Playwright (@playwright/test)"),
  bullet("TypeScript"),
  boldLine("Supporting libraries and utilities"),
  bullet("@faker-js/faker — dynamic test data."),
  bullet("mailosaur — email-driven flows where configured."),
  bullet("otplib — TOTP/2FA where required."),
  bullet("dotenv — environment configuration."),
  bullet("date-fns, lodash, uuid — helpers."),
  bullet("axios, graphql-request — optional API/helper usage."),
  bullet("xlsx, pdf-parse — file/document handling where scenarios need them."),
  bullet("@axe-core/playwright — accessibility checks where used."),
  boldLine("Development tools"),
  bullet("Visual Studio Code (or equivalent IDE)"),
  bullet("Git"),
  bullet("Node.js (LTS recommended)"),
  boldLine("Reporting"),
  bullet("Playwright HTML report (npx playwright show-report)"),
  bullet("Allure (allure-playwright; generate/open via npm scripts)"),
  boldLine("Code quality"),
  bullet("Prettier"),
  bullet("Husky (git hooks via prepare)"),
  bullet("TypeScript strict typing as project standard"),

  h1("6. Repository Structure"),
  p("The repository follows a modular layout under src/ (aligned with Jump App features):"),
  codeP(repoTree),
  p(
    "Update src/config/.env.<environment> when base URL, credentials, Mailosaur, or toggles (e.g. SKIP_GLOBAL_LOGIN) change for a new environment or tenant.",
  ),
  bullet("Jump App base URL (JUMPAPP_BASE_URL or URL)."),
  bullet("Test user credentials and 2FA secret where applicable."),
  bullet("Optional Mailosaur and teardown API settings per README."),
  italicLine("Guideline for branching and pull requests (Git):"),
  bullet("git fetch --all"),
  bullet("git branch -a"),
  bullet("git add"),
  bullet('git commit -m "<message>"'),
  bullet("git push -u origin <branch>"),

  h1("7. Test Coverage Targets"),
  boldLine("Coverage goals (indicative)"),
  bullet(
    "Core Jump App workflows (login, meetings, new meeting, home) — target high coverage (e.g. 80% of prioritized scenarios).",
  ),
  bullet("UI critical paths across modules — strong coverage (e.g. 70% of prioritized UI paths)."),
  boldLine("Examples of automated areas (as implemented in the repo)"),
  bullet("Login and logout"),
  bullet("Home"),
  bullet(
    "Meetings (view toggles, calendar settings, navigation, filters, list tabs, day range, actions on meetings)",
  ),
  bullet("New meeting"),
  bullet("Actions"),
  bullet("Contacts"),

  h1("8. CI/CD Integration"),
  p("Automation is designed to run in CI/CD with triggers such as:"),
  bullet("Pull request validation"),
  bullet("Nightly regression runs"),
  bullet("Pre-release validation"),
  italicLine("Example commands:"),
  bullet("npm run test:staging — full run against staging environment"),
  bullet("npm run test:staging:smoke — grep @smoke"),
  bullet("npm run test:staging:regression — grep @regression"),
  bullet("npx playwright test <path-to-spec>"),
  bullet('npx playwright test --project Chromium'),

  h1("9. Test Data Strategy"),
  p(
    "Test data is managed primarily through TypeScript data modules under src/data/, resolved by getDataSet(filename, datasetName, testCase) in env.utils, with optional environment-specific folders under data/<NODE_ENV>/.",
  ),
  p(
    "Dynamic values use @faker-js/faker where scenarios require unique data. Email flows can use Mailosaur when environment variables are set.",
  ),
  p(
    "Authentication state: Google (or other) login can produce storage state files under src/cookies/ for reuse in module specs, controlled by setup specs and SKIP_GLOBAL_LOGIN.",
  ),
  italicLine("Setup before a local run:"),
  bullet("npm install"),
  bullet("npx playwright install (browsers)"),
  bullet("Copy src/config/.env.example to src/config/.env.staging (or appropriate env) and fill secrets"),
  bullet("npm run test:staging (or a targeted spec)"),
  bullet("npx playwright show-report and/or Allure generate/open scripts"),

  h1("10. Reporting and Monitoring"),
  p("Reports after execution include:"),
  bullet("Playwright HTML report (steps, traces, attachments)"),
  bullet("Allure report (trends when history is preserved via project scripts)"),
  p("Reports support execution status, screenshots, video, traces, and analysis of failures."),

  h1("11. Governance"),
  italicLine("QA automation engineers"),
  bullet("Maintain the Playwright framework and conventions (POM, fixtures, data separation)."),
  bullet("Develop and stabilize automation scripts."),
  bullet("Maintain test data modules and coverage alignment with product priorities."),
  italicLine("Developers"),
  bullet("Maintain unit tests and support testability (stable selectors, feature flags)."),
  bullet("Support automation stability when UI or APIs change."),
  italicLine("Product team"),
  bullet("Define and prioritize business workflows for automation."),
  bullet("Align regression scope with release risk."),

  h1("12. Definition of Done for Automation"),
  p("Automation for a scenario is complete when:"),
  bullet(
    "Page objects use LocatorInfo and shared action/verification factories as per project standards.",
  ),
  bullet("Test data lives in data files, not hardcoded in specs (except minimal wiring)."),
  bullet("Tests are added to the appropriate suite and tagged where applicable."),
  bullet("Tests pass consistently on the target environment."),
  bullet("Code is reviewed and merged."),
  bullet("Documentation (README and this strategy) is updated when behavior or setup changes."),

  h1("13. Risks and Considerations"),
  boldLine("Third-party and authentication"),
  bullet(
    "Google login and 2FA depend on valid credentials and secrets; changes to OAuth or UI can break setup flows.",
  ),
  boldLine("Environment dependencies"),
  bullet(
    "Staging availability, feature flags, and data shape affect pass rates; tests assume a known baseline environment.",
  ),
  boldLine("UI stability"),
  bullet(
    "Dynamic UI or timing can cause flaky tests; mitigations include stable locators, appropriate waits, and retries in CI where configured.",
  ),
  boldLine("Test data and cleanup"),
  bullet(
    "Long-lived data or shared accounts may require teardown hooks (global-teardown, optional API) where enabled.",
  ),

  h1("14. Deliverables"),
  bullet("Playwright and TypeScript automation framework for Jump App"),
  bullet("Automated regression and feature test suites under src/specs/"),
  bullet("Page objects and data modules for login, home, meetings, new meeting, actions, and contacts"),
  bullet("Automated test reports (Playwright HTML, Allure)"),
  bullet("Project README and environment configuration guidance"),
  bullet("This automation strategy document"),

  p(
    "Document aligned with repository jump-app-playwright-framework. Generated as Jump_App_automation_strategy.docx.",
  ),
];

const doc = new Document({
  sections: [
    {
      properties: {},
      children,
    },
  ],
});

const buf = await Packer.toBuffer(doc);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buf);

const copyPath = "D:\\Jump document\\Jump_App_automation_strategy.docx";
try {
  fs.mkdirSync(path.dirname(copyPath), { recursive: true });
  fs.copyFileSync(outPath, copyPath);
  console.log("Wrote:", outPath);
  console.log("Copied:", copyPath);
} catch {
  console.log("Wrote:", outPath);
  console.log("(Optional copy to D:\\Jump document\\ skipped — folder not writable or missing.)");
}
