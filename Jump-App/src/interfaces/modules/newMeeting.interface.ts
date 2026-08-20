import { TestCaseData } from "@interfaces/testcase.data.interface";

export interface UploadMeetingAudioTestCaseData {
  baseUrl: string;
  meetingUrl?: string;
  uploadFilePath?: string;
  testCaseData: TestCaseData;
}

export interface SendNotetakerTestCaseData {
  baseUrl: string;
  meetingUrl: string;
  testCaseData: TestCaseData;
}

export interface JoinMyCallTestCaseData {
  baseUrl: string;
  phoneNumber: string;
  ext: string;
  nickname: string;
  testCaseData: TestCaseData;
}

export interface CaptureMeetingNowTestCaseData {
  baseUrl: string;
  testCaseData: TestCaseData;
}

export interface BookingWindowWeeklyTestCaseData {
  baseUrl: string;
  testCaseData: TestCaseData;
}

export interface BookingWindowDoNotRepeatTestCaseData {
  baseUrl: string;
  testCaseData: TestCaseData;
}
