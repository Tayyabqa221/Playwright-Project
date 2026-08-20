export interface AttachmentData {
  content: string;
  contentType: 'application/docx' | 'application/pdf' | 'application/xlsx' | 'image/png';
  fileName: string;
  id: string;
}

export interface SendEmailData {
  attachment?: AttachmentData[];
  from: string;
  htmlContent: string;
  subject: string;
  textContent: string;
  to: string;
}

export interface ReplyEmailData {
  textContent: string;
}

export interface ReplyFromMailosureData {
  htmlContent: string;
  textContent: string;
}

export interface SuggestionsData {
  value: number;
}
