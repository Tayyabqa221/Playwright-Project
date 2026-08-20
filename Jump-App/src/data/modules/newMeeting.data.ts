import {
  UploadMeetingAudioTestCaseData,
  SendNotetakerTestCaseData,
  JoinMyCallTestCaseData,
  CaptureMeetingNowTestCaseData,
  BookingWindowWeeklyTestCaseData,
  BookingWindowDoNotRepeatTestCaseData,
} from "../../interfaces/modules/newMeeting.interface";

const newMeetingTestData: {
  [key: string]:
    | UploadMeetingAudioTestCaseData
    | SendNotetakerTestCaseData
    | JoinMyCallTestCaseData
    | CaptureMeetingNowTestCaseData
    | BookingWindowWeeklyTestCaseData
    | BookingWindowDoNotRepeatTestCaseData;
} = {
  "upload-meeting-audio": {
    baseUrl: process.env.JUMPAPP_BASE_URL || "https://staging.jumpapp.dev/",
    meetingUrl: undefined,
    uploadFilePath: "src/data/audio/Test Audio.mp4",
    testCaseData: {
      tags: "@smoke @meetings @uploadAudio",
      testCase: "TC-JUMPAPP-002",
      testDescription: "Create meeting using Upload audio; wait for notes processing to complete",
      testSummary: "Open Create new → Upload audio → Select file → wait for notes processing to complete",
    },
  },
  "send-notetaker-to-meeting": {
    baseUrl: process.env.JUMPAPP_BASE_URL || "https://staging.jumpapp.dev/",
    meetingUrl: "meet.google.com/jdu-rftq-jdn",
    testCaseData: {
      tags: "@smoke @meetings @sendNotetaker",
      testCase: "TC-JUMPAPP-003",
      testDescription: "Send notetaker to meeting and verify success toast",
      testSummary: "New meeting → Send notetaker to meeting → enter Meet URL → verify toast",
    },
  },
  "join-my-call": {
    baseUrl: process.env.JUMPAPP_BASE_URL || "https://staging.jumpapp.dev/",
    phoneNumber: process.env.JUMPAPP_JOIN_CALL_PHONE || "+44 1632 960123",
    ext: process.env.JUMPAPP_JOIN_CALL_EXT || "",
    nickname: process.env.JUMPAPP_JOIN_CALL_NICKNAME || "Playwright Test",
    testCaseData: {
      tags: "@smoke @meetings @joinMyCall",
      testCase: "TC-JUMPAPP-004",
      testDescription: "Join my call: fill Phone, Ext, Nickname → Call now → verify toast",
      testSummary: "New meeting → Join my call → fill form → Call now → verify toast",
    },
  },
  "capture-meeting-now": {
    baseUrl: process.env.JUMPAPP_BASE_URL || "https://staging.jumpapp.dev/",
    testCaseData: {
      tags: "@smoke @meetings @captureMeetingNow",
      testCase: "TC-JUMPAPP-005",
      testDescription: "New meeting → Capture meeting now → verify Meeting captured label",
      testSummary: "New meeting → Capture meeting now → wait for Meeting captured label",
    },
  },
  "booking-window-weekly": {
    baseUrl: process.env.JUMPAPP_BASE_URL || "https://staging.jumpapp.dev/",
    testCaseData: {
      tags: "@smoke @meetings @bookingWindowWeekly @home",
      testCase: "TC-JUMPAPP-006",
      testDescription:
        "Weekly booking window → No thanks → Cancel → Home → scroll bottom → verify window name",
      testSummary:
        "New meeting → Booking window Weekly → Done → No thanks → Cancel → Home → verify name at page bottom",
    },
  },
  "booking-window-do-not-repeat": {
    baseUrl: process.env.JUMPAPP_BASE_URL || "https://staging.jumpapp.dev/",
    testCaseData: {
      tags: "@smoke @meetings @bookingWindowDoNotRepeat",
      testCase: "TC-JUMPAPP-007",
      testDescription: "New meeting → Create Booking Window Do not repeat → name, Video Google, Done, Close",
      testSummary: "New meeting → Create Booking Window Do not repeat → enter name → save",
    },
  },
};

export function getData(
  testCase: string
):
  | UploadMeetingAudioTestCaseData
  | SendNotetakerTestCaseData
  | JoinMyCallTestCaseData
  | CaptureMeetingNowTestCaseData
  | BookingWindowWeeklyTestCaseData
  | BookingWindowDoNotRepeatTestCaseData {
  const data = newMeetingTestData[testCase];
  if (!data) {
    throw new Error(`Test case data not found for: ${testCase}`);
  }
  return data;
}
