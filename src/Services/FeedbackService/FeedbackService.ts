import * as moment from "moment";
import { SPLists } from "../../Config/config";
import { setFeedbacksdata } from "../../Redux/Features/FeedbackSlice";
import { peopleHandler } from "../CommonService/CommonService";
import SpServices from "../SPServices/SpServices";

const FetchFeedBacks = async () => {
  const items = await SpServices.SPReadItems({
    Listname: SPLists.FeedbackList,
    Orderby: "ID",
    Orderbydecorasc: false,
  });
  const formatted = items.map((item: any) => {
    return {
      Id: item.ID,
      Title: item.Title,
      Description: item.Description,
      CommentsCount: item.CommentCount,
    };
  });
  return formatted;
};
const addFeedbacks = async (payload: any, setFeedbacks: any, dispatch: any) => {
  await SpServices.SPAddItem({
    Listname: SPLists.FeedbackList,
    RequestJSON: payload,
  }).then(() => {
    setFeedbacks((prev: any[]) => [...prev, payload]);
    dispatch(setFeedbacksdata);
  });
};
const FetchConversations = async (FeedbackId: any, setConversation?: any) => {
  const items = await SpServices.SPReadItems({
    Listname: SPLists.ConversationList,
    Expand: "FeedbackOf,Author",
    Select: "*,FeedbackOf/ID,Author/Title,Author/EMail,Author/ID",
  });

  const filteredItems = items.filter(
    (item: any) => item.FeedbackOfId === FeedbackId
  );
  const formatedData = filteredItems.map((comment: any) => ({
    Id: comment.ID,
    comments: comment.Comments,
    FeedbackId: comment.FeedbackOfId,
    CreatedBy: peopleHandler([comment.Author]),
    CreatedOn: moment(comment?.Created).format("YYYY-MM-DD HH:mm:ss"),
  }));

  if (setConversation) setConversation(formatedData);

  console.log("Filtered Conversations:", formatedData);
  return filteredItems;
};
const updateFeedback = async (commentItem: any, feedbackId: any) => {};

export { addFeedbacks, FetchFeedBacks, FetchConversations, updateFeedback };
