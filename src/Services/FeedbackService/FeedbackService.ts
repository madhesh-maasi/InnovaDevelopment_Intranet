/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
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
    Topcount: 9,
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
const addFeedbacks = async (
  payload: any,
  setFeedbacks: any,
  dispatch: any,
  toastRef?: any
) => {
  await SpServices.SPAddItem({
    Listname: SPLists.FeedbackList,
    RequestJSON: payload,
  }).then((res: any) => {
    const tempfeedback = {
      Id: res?.data?.Id,
      Title: payload.Title,
      Description: payload.Description,
      CommentsCount: payload.CommentCount,
    };
    setFeedbacks((prev: any[]) => [tempfeedback, ...prev]);
    dispatch(setFeedbacksdata);
    toastRef?.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Feedback added successfully!",
      life: 3000,
    });
  });
};
const updateFeedback = async (feedbackId: number, commentsCount: number) => {
  try {
    await sp.web.lists.getByTitle("FeedBack").items.getById(feedbackId).update({
      CommentCount: commentsCount,
    });

    // console.log(
    //   `Feedback item ${feedbackId} updated with comment count: ${commentsCount}`
    // );
  } catch (error) {
    console.error("Error updating feedback comment count:", error);
  }
};
const addConversations = async (
  feedbackId: any,
  comment: any,
  conversations: any,
  setConversation: any,
  currentUser: any
) => {
  await SpServices.SPAddItem({
    Listname: SPLists.ConversationList,
    RequestJSON: {
      Comments: comment,
      FeedbackOfId: feedbackId,
    },
  }).then(async (conversation: any) => {
    const formatedData = {
      Id: conversation?.data?.ID,
      comments: conversation?.data?.Comments,
      FeedbackId: conversation?.data?.FeedbackOfId,
      CreatedBy: peopleHandler(currentUser),
      CreatedOn: moment(conversation?.data?.Created).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
    };
    let tempData = [...conversations, formatedData];
    await setConversation((prev: any) => [...tempData]);
    updateFeedback(feedbackId, tempData.length);
    // console.log("Updated Conversation", conversation);
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

  // console.log("Filtered Conversations:", formatedData);
  return filteredItems;
};

export {
  addFeedbacks,
  FetchFeedBacks,
  addConversations,
  FetchConversations,
  updateFeedback,
};
