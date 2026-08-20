
# Jump App Playwright Automation Framework

Focused E2E automation for Jump App.

## Prerequisites

- Node.js LTS 
- Playwright browsers: `npx playwright install`

## Setup

1) Install dependencies

```bash
npm install
```

2) Environment variables

- Copy `src/config/.env.example` to `src/config/.env.staging` and fill in secrets locally. The example file is safe to commit; `.env.staging` stays untracked (see `.gitignore`).
- You can also add `.env.dev` / `.env.prod` the same way. Example shape for `.env.staging`:

```env
# Jump App (required for login / data modules)
JUMPAPP_BASE_URL=https://staging.jumpapp.dev/
JUMPAPP_EMAIL=
JUMPAPP_PASSWORD=
JUMPAPP_2FA_SECRET=

# Global flow toggles
SKIP_GLOBAL_LOGIN=false
SKIP_GLOBAL_TEARDOWN=false

# Optional: teardown cleanup API (only if your environment provides it)
TEARDOWN_API_ENDPOINT=
TEARDOWN_API_SECRET=

# Optional: Mailosaur (email workflows)
mailosaurServerId=
mailosaurDomain=
mailosaurApiKey=
```

- The framework defaults to `NODE_ENV=staging`.

### How baseURL is picked

- `playwright.config.ts` loads `src/config/.env.$NODE_ENV` and sets `use.baseURL` from `JUMPAPP_BASE_URL`:

```ts
// playwright.config.ts (excerpt)
const env = process.env.NODE_ENV || "staging";
const envPath = path.resolve(process.cwd(), "src", "config", `.env.${env}`);
dotenv.config({ path: envPath, override: true });
const baseURL = process.env.JUMPAPP_BASE_URL || "https://staging.jumpapp.dev/";
```

- In tests/pages, navigate with relative paths (e.g. `/`) so Playwright resolves against `use.baseURL`.

## Running tests

```bash
# staging env
npm run test:staging
```

- Run a specific spec:

```bash
npx playwright test src/specs/homepage/homepage.spec.ts
```

- Run by tag:

```bash
npx playwright test --grep "@smoke"
```

- Run by Playwright project (see projects in `playwright.config.ts`):

```bash
# desktop web (Chromium project)
npx playwright test --project="Chromium"
```

- Test file naming:
  - Use `*.spec.ts` for all tests; organize by feature under `src/specs/` (e.g., `login`, `modules`).

## Reports (Allure)

```bash
# after a test run
npm run allure:generate
npm run allure:open
```

If needed, clean results first:

```bash
npm run clean:allure
```

Docker `run-tests.sh` can sync Allure history to/from GCS when you set **`ALLURE_GCS_BUCKET_URI`** (for example `gs://your-bucket-name`). If it is unset, GCS steps are skipped.

## Playwright HTML report

```bash
# after a test run
npx playwright show-report
```

## Project structure

```
jump-app/
├── package.json
├── playwright.config.ts
├── README.md
├── tsconfig.json
├── allure-results/
├── node_modules/
├── src/
│   ├── config/
│   │   ├── .env.example
│   │   └── .env.staging   # local only (gitignored)
│   ├── data/
│   │   ├── login/
│   │   └── modules/
│   ├── fixtures/
│   │   ├── page.fixtures.ts
│   │   └── mergePage.fixture.ts
│   ├── interfaces/
│   │   ├── login/
│   │   ├── modules/
│   │   ├── locator.info.interface.ts
│   │   ├── mailosaur.interface.ts
│   │   └── testcase.data.interface.ts
│   ├── page/
│   │   ├── login/
│   │   └── modules/
│   ├── specs/
│   │   ├── login/
│   │   └── modules/
│   └── utilities/
│       ├── api.utils.ts
│       ├── common.utils.ts
│       ├── env.utils.ts
│       ├── general.utils.ts
│       ├── playwright.actions.utils.ts
│       ├── playwright.verifications.utils.ts
│       ├── random.utils.ts
│       ├── storage.state.utils.ts
│       ├── test.helper.utils.ts
│       ├── testData.generate.utils.ts
│       ├── mailosaur/
│       │   ├── mailosaur.settings.ts
│       │   └── mailosaur.utils.ts
│       └── global/
│           ├── global-setup.utils.ts
│           └── global-teardown.utils.ts
```

## Scripts

From `package.json`:

```json
"scripts": {
  "prepare": "husky",
  "test:staging": "cross-env NODE_ENV=staging && npx playwright test",
  "clean:allure": "rimraf allure-results",
  "test:staging:clean": "npm run clean:allure && cross-env NODE_ENV=staging npx playwright test || echo 'Test run has failures. Check the report for details.'",
  "allure:copy:history": "copyfiles -u 1 allure-report/history/** allure-results",
  "allure:generate": "npm run allure:copy:history && allure generate allure-results --clean",
  "allure:open": "allure open",
  "test:staging:allure:open": "npm run clean:allure && cross-env NODE_ENV=staging npx playwright test || echo 'Test run has failures. Check the report for details.' && npm run allure:generate && npm run allure:open"
}
```

## Notes

- Base URL is selected from `URL` in `src/config/.env.$NODE_ENV`.
- Use relative navigation in page objects: `page.goto('/')` or helper methods that pass `"/"`, so Playwright applies `use.baseURL`.
- To debug, print effective values at startup:

```ts
```
- Test data is resolved per `NODE_ENV` in `src/utilities/env.utils.ts` (default: `prod`).
 - Set `EmbedScreenshotsInReport=true` in your `.env` to embed screenshots into Allure attachments when available.
 - HTML reporter is enabled; open it with `npx playwright show-report` after a run.
