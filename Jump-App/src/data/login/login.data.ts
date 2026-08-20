import { getEnvVariable } from "@utilities/env.utils";
import { JumpAppLoginTestCaseData } from "@interfaces/login/login.interfaces";

const loginTestData: { [key: string]: JumpAppLoginTestCaseData } = {
  "Login-001": {
    baseUrl: getEnvVariable("JUMPAPP_BASE_URL"),
    loginData: {
      email: process.env.JUMPAPP_EMAIL || "",
      password: process.env.JUMPAPP_PASSWORD || "",
    },
    testCaseData: {
      tags: "@smoke @regression @jumpappLogin",
      testCase: "Login-001",
      testDescription: "Validate Jump App login with Google and optional 2FA",
      testSummary: "Login to Jump App via Google; save auth state for downstream tests",
    },
  },
};

export function getData(testCase: string): JumpAppLoginTestCaseData {
  const data = loginTestData[testCase];
  if (!data) {
    throw new Error(`Test case data not found for: ${testCase}`);
  }
  return data;
}
