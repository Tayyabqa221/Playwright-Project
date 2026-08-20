import { TestInfo } from '@playwright/test';

interface TestCaseData {
  tags: string;
  testCase: string;
  testDescription: string;
  testSummary: string;
}

export async function logTestCaseData(testInfo: TestInfo, scenario: TestCaseData): Promise<void> {
  // Add test key (assuming testCase contains the JIRA test key)
  testInfo.annotations.push({ description: scenario.testCase, type: 'test_key' });

  // Add test summary (now using testDescription)
  testInfo.annotations.push({ description: scenario.testSummary, type: 'test_summary' });
}
