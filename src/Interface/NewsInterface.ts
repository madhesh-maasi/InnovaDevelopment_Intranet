export interface IThumbnail {
  id?: number;
  fileName: string;
  url: string;
  file?: File | null;
}

export interface INewsItem {
  id: number;
  title: string;
  description: string;
  thumbnail?: IThumbnail | null;
  siteUrl?: string;
}
export interface INewsTemplate {
  Id?: number;
  Title: string;
  FileRef?: string;
  EncodedAbsUrl?: string;
  ServerRedirectedEmbedUri?: string;
  UniqueId?: string;
  Description?: string;
  BannerImageUrl?: string;
  StartDate: Date;
  EndDate: Date;
  Thumbnail?: IThumbnail | null;
}
