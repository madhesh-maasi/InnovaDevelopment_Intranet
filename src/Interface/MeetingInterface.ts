export interface IMeetingItem {
  Type: "Video" | "Link";
  FileName: string;
  FileUrl: string;
  Date: string;
}