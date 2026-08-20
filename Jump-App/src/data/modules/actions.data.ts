import { ActionsTestCaseData } from "@interfaces/modules/actions.interface";

const actionsTestData: { [key: string]: ActionsTestCaseData } = {};

export function getData(testCase: string): ActionsTestCaseData {
  const data = actionsTestData[testCase];
  if (!data) {
    throw new Error(`Test case data not found for: ${testCase}. Add data in data/modules/actions.data.ts`);
  }
  return data;
}
