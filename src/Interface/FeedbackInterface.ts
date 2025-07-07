import { IUserDetails } from "./CommonInterface";

export interface IFeedbacktype {
  Id?: number | null;
  Title: string;
  Description: string;
  CommentsCount?: number;
}
export interface IConversationType {
  Id?: number;
  comments: string;
  FeedbackId: number;
  CreatedBy: IUserDetails;
  CreatedOn: string;
}
