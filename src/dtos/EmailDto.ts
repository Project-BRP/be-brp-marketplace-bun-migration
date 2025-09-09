export interface IEmailDto {
  from: string;
  to: string;
  subject: string;
  html: any;
  attachments?: {
    filename: string;
    path: string;
    contentType: string;
  }[];
}
