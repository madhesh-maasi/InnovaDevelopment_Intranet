import * as moment from "moment";
import { SPLists } from "../../Config/config";
import { setFeedbacksdata } from "../../Redux/Features/FeedbackSlice";
import { peopleHandler } from "../CommonService/CommonService";
import SpServices from "../SPServices/SpServices";
import { sp } from "@pnp/sp";

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
    setFeedbacks((prev: any[]) => [payload, ...prev]);
    dispatch(setFeedbacksdata);
  });
};
const addConversations = async (
  feedbackId: any,
  comment: any,
  setConversation: any,
  currentUser: any
) => {
  await SpServices.SPAddItem({
    Listname: SPLists.ConversationList,
    RequestJSON: {
      Comments: comment,
      FeedbackOfId: feedbackId,
    },
  }).then((conversation: any) => {
    const formatedData = {
      Id: conversation?.data?.ID,
      comments: conversation?.data?.Comments,
      FeedbackId: conversation?.data?.FeedbackOfId,
      CreatedBy: peopleHandler(currentUser),
      CreatedOn: moment(conversation?.data?.Created).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
    };
    setConversation((prev: any) => [...prev, formatedData]);

    console.log("Updated Conversation", conversation);
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
const updateFeedback = async (feedbackId: number, commentsCount: number) => {
  try {
    await sp.web.lists.getByTitle("FeedBack").items.getById(feedbackId).update({
      CommentCount: commentsCount,
    });

    console.log(
      `Feedback item ${feedbackId} updated with comment count: ${commentsCount}`
    );
  } catch (error) {
    console.error("Error updating feedback comment count:", error);
  }
};

export {
  addFeedbacks,
  FetchFeedBacks,
  addConversations,
  FetchConversations,
  updateFeedback,
};
