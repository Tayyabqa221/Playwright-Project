import { TestCaseData } from "@interfaces/testcase.data.interface";

export interface LoginData {
  email: string;
  password: string;
}

export interface JumpAppLoginTestCaseData {
  baseUrl: string;
  loginData: LoginData;
  testCaseData: TestCaseData;
}
