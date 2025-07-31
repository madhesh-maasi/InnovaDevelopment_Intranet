/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import * as React from "react";
import type { IFeedbackProps } from "./IFeedbackProps";
import styles from "./Feedback.module.scss";

import { sp } from "@pnp/sp/presets/all";
import { graph } from "@pnp/graph/presets/all";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../../../Redux/Store/Store";

import { DirectionalHint, TooltipHost } from "@fluentui/react";
import {
  IConversationType,
  IFeedbacktype,
} from "../../../Interface/FeedbackInterface";
import {
  addConversations,
  addFeedbacks,
  FetchConversations,
  FetchFeedBacks,
  updateFeedback,
} from "../../../Services/FeedbackService/FeedbackService";
import { setFeedbacksdata as setFeedbacksAction } from "../../../Redux/Features/FeedbackSlice";
import { Toast } from "primereact/toast";
import CustomHeader from "../../../CommonComponents/webpartsHeader/CustomerHeader/CustomHeader";
import CustomaddBtn from "../../../CommonComponents/webpartsHeader/CustomaddBtn/CustomaddBtn";
import {
  setCurrentUserDetails,
  setMainSPContext,
  setSiteUrl,
  setTenantUrl,
  setWebUrl,
} from "../../../Redux/Features/MainSPContextSlice";
import { useEffect, useRef, useState } from "react";
import { togglePopupVisibility } from "../../../CommonComponents/CustomPopup/togglePopup";
import CustomInputField from "../../../CommonComponents/CustomInputField/CustomInputField";
import CustomMultiInputField from "../../../CommonComponents/CustomMultiInputField/CustomMultiInputField";
import Popup from "../../../CommonComponents/CustomPopup/Popup";
import { Avatar } from "primereact/avatar";
import "../../../Config/style.css";
import { getPermissionLevel } from "../../../Services/CommonService/CommonService";
const FeedbackContent: React.FC<IFeedbackProps> = ({ context }) => {
  const dispatch = useDispatch();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const currentuser = useSelector(
    (state: any) => state.MainSPContext.currentUserDetails
  );
  const toastRef = React.useRef<any>(null);
  const [feedbacks, setFeedbacks] = useState<IFeedbacktype[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [comments, setComments] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState({
    Id: 0,
    title: "",
    description: "",
  });
  const [conversations, setConversations] = useState<IConversationType[]>([]);
  // console.log(conversations);
  const itemsPerPage = 3;
  const webUrl = context?.pageContext?.web?.absoluteUrl;
  const siteUrl = context?.pageContext?.site?.serverRelativeUrl;
  const tenantUrl = webUrl?.split("/sites")[0];

  const setContext = async () => {
    try {
      const currentUserDetails = await sp.web.currentUser.get();
      const currentUser = [
        {
          Id: currentUserDetails.Id,
          Email: currentUserDetails.Email,
          DisplayName: currentUserDetails.Title,
          ImgUrl: `/_layouts/15/userphoto.aspx?size=S&accountname=${currentUserDetails.Email}`,
        },
      ];
      dispatch(setCurrentUserDetails(currentUser));
      if (webUrl) dispatch(setWebUrl(webUrl));
      if (siteUrl) dispatch(setSiteUrl(siteUrl));
      if (tenantUrl) dispatch(setTenantUrl(tenantUrl));
    } catch (err) {
      console.error("Error setting context:", err);
    }
  };
  const initialPopupController = [
    {
      open: false,
      popupTitle: "",
      popupWidth: "50%",
      defaultCloseBtn: false,
      popupData: "",
    },
    {
      open: false,
      popupTitle: "",
      popupWidth: "50%",
      defaultCloseBtn: false,
      popupData: "",
    },
  ];
  const [popupController, setPopupController] = useState(
    initialPopupController
  );
  const commentsEndRef = useRef<HTMLDivElement | null>(null);

  const handleClosePopup = (index: number): void => {
    togglePopupVisibility(setPopupController, index, "close");
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    CommentsCount: 0,
  });
  const scrollToBottom = () => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollTop = commentsEndRef.current.scrollHeight;
    }
  };
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitFuction = async () => {
    const { title, description, CommentsCount } = formData;
    const missingFields = [];
    if (!title?.trim()) missingFields.push("Title");
    if (!description?.trim()) missingFields.push("Description");
    if (missingFields.length > 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Missing fields",
        detail: `Please enter ${missingFields.join(", ")} before submitting.`,
        life: 3000,
      });
      return;
    }
    try {
      setIsLoading(true);
      const payload = {
        Title: title,
        Description: description,
        CommentCount: CommentsCount,
      };
      await addFeedbacks(payload, setFeedbacks, dispatch, toastRef);
      handleClosePopup(0);
      setFormData({ title: "", description: "", CommentsCount: 0 });
    } catch (err) {
      toastRef.current?.show({
        severity: "error",
        summary: "Failed",
        detail: "Something went wrong while submitting feedback",
        life: 3000,
      });
      console.error("Upload failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comments.trim()) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Empty Comment",
        detail: "Please enter a comment before sending.",
        life: 3000,
      });
      return;
    }
    await addConversations(
      selectedFeedback.Id,
      comments,
      conversations,
      setConversations,
      currentuser
    );
    await onCommentClose("onSubmit");
    setComments("");
  };

  const popupInputs: any[] = [
    [
      <>
        <div className={styles.inputWrapper}>
          <div className={styles.customwrapper}>
            <CustomInputField
              label="Title*"
              value={formData.title}
              onChange={(e: any) => handleFormChange("title", e.target.value)}
              placeholder="Title"
            />
          </div>
          <div className={styles.customwrapper}>
            <CustomMultiInputField
              label="Description*"
              value={formData.description}
              onChange={(e: any) =>
                handleFormChange("description", e.target.value)
              }
              rows={2}
              placeholder="Description"
              autoResize={false}
            />
          </div>
        </div>
      </>,
    ],
    [
      <div
        key={1}
        style={{ width: "100%", minHeight: "69vh", padding: "0 10px" }}
      >
        <div
          className={styles.card}
          key={1}
          // style={{ backgroundColor: "#ccc" }}
        >
          <TooltipHost
            content={selectedFeedback.title}
            tooltipProps={{
              directionalHint: DirectionalHint.bottomCenter,
            }}
          >
            <div className={styles.title}>{selectedFeedback.title}</div>
          </TooltipHost>
          <TooltipHost
            content={selectedFeedback.description}
            tooltipProps={{
              directionalHint: DirectionalHint.bottomCenter,
            }}
          >
            <div style={{ fontSize: "12px" }}>
              <p>{selectedFeedback.description}</p>
            </div>
          </TooltipHost>
        </div>
        <div style={{ height: "65vh" }}>
          <div className={styles.commentsWrapper} ref={commentsEndRef}>
            {conversations.map((comment: any, i: any) => {
              if (comment?.CreatedBy?.Email === currentuser[0]?.Email) {
                return (
                  <div className={styles.currentuserWrapper}>
                    <div key={i} className={styles.currentuser}>
                      <div className={styles.commentContentWrapper}>
                        <div>
                          <span style={{ fontWeight: "400" }}>
                            {comment.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.dateTimeWrapper}>
                      <i className="pi pi-clock" />
                      <span>{comment.CreatedOn}</span>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div style={{ display: "flex", width: "100%" }}>
                    <div className={styles.avatarWrapper}>
                      <Avatar
                        image={comment?.CreatedBy?.ImgUrl}
                        size="normal"
                        shape="circle"
                      />
                    </div>
                    <div className={styles.cardWrapper}>
                      <div key={i} className={styles.card}>
                        <div className={styles.commentContentWrapper}>
                          <div>
                            <span>{comment.comments}</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.dateTimeWrapper}>
                        <div>{comment?.CreatedBy?.DisplayName}</div>
                        <i className="pi pi-clock" />
                        <span>{comment.CreatedOn}</span>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
          <div className={styles.commentInputBar}>
            <CustomInputField
              value={comments}
              onChange={(e: any) => setComments(e.target.value)}
              placeholder="Type your comments here...."
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  handleCommentSubmit();
                }
              }}
              isChat={true}
            />
            <div style={{ padding: "0 10px" }} onClick={handleCommentSubmit}>
              <img
                src={require("../assets/send.png")}
                width="24px"
                height="24px"
              />
            </div>
          </div>
        </div>
      </div>,
    ],
  ];
  const popupActions: any[] = [
    [
      {
        text: "Cancel",
        btnType: "closeBtn",
        disabled: false,
        endIcon: false,
        startIcon: false,
        onClick: () => {
          handleClosePopup(0);
          setFormData({
            title: "",
            description: "",
            CommentsCount: 0,
          });
        },
      },
      {
        text: "Submit",
        btnType: "primaryBtn",
        disabled: false,
        endIcon: false,
        startIcon: false,
        onClick: () => {
          !isLoading && handleSubmitFuction();
        },
      },
    ],
  ];
  const getFeedbackData = async () => {
    const list = await FetchFeedBacks();
    setFeedbacks(list);
    dispatch(setFeedbacksAction(list));
  };
  const checkPermission = async () => {
    const result = await getPermissionLevel(currentuser);
    setIsAdmin(result);
  };
  useEffect(() => {
    setContext();
    dispatch(setMainSPContext(context));
    getFeedbackData();
  }, []);
  useEffect(() => {
    if (currentuser && currentuser.length > 0) {
      checkPermission();
    }
  }, [currentuser]);
  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const totalPages = Math.ceil(feedbacks.length / itemsPerPage);
  const paginatedData = feedbacks.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (index: number) => {
    setCurrentPage(index);
  };

  const nextSlide = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };
  const onCommentClose = async (type: any) => {
    if (type === "onClose") {
      const tempfeedindex = feedbacks.findIndex(
        (f) => f.Id === selectedFeedback.Id
      );

      if (tempfeedindex !== -1) {
        const updatedItem = {
          ...feedbacks[tempfeedindex],
          CommentsCount: conversations.length,
        };
        const updatedData = [...feedbacks];
        updatedData[tempfeedindex] = updatedItem;
        setFeedbacks(updatedData);
        await updateFeedback(selectedFeedback.Id, conversations.length);
        setConversations([]);
        setComments("");
      }
    }
    if (type === "onSubmit") {
      const tempfeedindex = feedbacks.findIndex(
        (f) => f.Id === selectedFeedback.Id
      );

      if (tempfeedindex !== -1) {
        const updatedItem = {
          ...feedbacks[tempfeedindex],
          CommentsCount: conversations.length,
        };
        const updatedData = [...feedbacks];
        updatedData[tempfeedindex] = updatedItem;
        setFeedbacks(updatedData);
        // await updateFeedback(selectedFeedback.Id, conversations.length + 1);
      }
    }
  };
  return (
    <>
      <Toast ref={toastRef} position="top-right" baseZIndex={1} />
      <div className={styles.feedbackContainer}>
        <div className={styles.headerWrapper}>
          <CustomHeader Header="Feedback" />
          {isAdmin ? (
            <CustomaddBtn
              onClick={() => {
                togglePopupVisibility(
                  setPopupController,
                  0,
                  "open",
                  `Feedback`,
                  "30%"
                );
              }}
            />
          ) : (
            <></>
          )}
        </div>

        {feedbacks.length > 0 ? (
          <div className={styles.carouselWrapper}>
            <div className={styles.cardsContainer}>
              {paginatedData.map((item, index) => (
                <div
                  className={styles.card}
                  key={index}
                  onClick={() => {
                    togglePopupVisibility(
                      setPopupController,
                      1,
                      "open",
                      `Conversation`,
                      "42%",
                      true
                    );
                    setSelectedFeedback({
                      Id: item.Id ? item.Id : 0,
                      title: item.Title,
                      description: item.Description,
                    });
                    FetchConversations(item.Id, setConversations);
                  }}
                >
                  <div className={styles.title}>{item.Title}</div>
                  <p>{item.Description}</p>
                  <div
                    className={styles.commentCount}
                    onClick={() => {
                      togglePopupVisibility(
                        setPopupController,
                        1,
                        "open",
                        `Conversation`,
                        "42%",
                        true
                      );
                      setSelectedFeedback({
                        Id: item.Id ? item.Id : 0,
                        title: item.Title,
                        description: item.Description,
                      });
                      FetchConversations(item.Id, setConversations);
                    }}
                  >
                    <i
                      className="fa-regular fa-comment-dots"
                      style={{
                        color: "green",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    />{" "}
                    {item.CommentsCount}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.paginationDots}>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <div
                  key={idx}
                  className={`${styles.dot} ${
                    idx === currentPage ? styles.active : ""
                  }`}
                  onClick={() => handlePageChange(idx)}
                />
              ))}
            </div>

            <button onClick={nextSlide} className={styles.nextBtn}>
              Next
            </button>
          </div>
        ) : (
          <div className={styles.noRecords}>No Records Found</div>
        )}
        <div>
          {popupController?.map((popupData: any, index: number) => (
            <Popup
              key={index}
              isLoading={isLoading}
              PopupType={popupData.popupType}
              onHide={() => {
                if (selectedFeedback) {
                  onCommentClose("onClose");
                }
                togglePopupVisibility(setPopupController, index, "close");
              }}
              popupTitle={popupData.popupTitle}
              popupActions={popupActions[index]}
              visibility={popupData.open}
              content={popupInputs[index]}
              popupWidth={popupData.popupWidth}
              defaultCloseBtn={popupData.defaultCloseBtn || false}
              confirmationTitle={
                popupData.popupType !== "custom" ? popupData.popupTitle : ""
              }
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default class Feedback extends React.Component<IFeedbackProps, {}> {
  constructor(prop: IFeedbackProps) {
    super(prop);
    sp.setup({ spfxContext: this.props.context as unknown as any });
    graph.setup({ spfxContext: this.props.context as unknown as any });
  }

  public render(): React.ReactElement<IFeedbackProps> {
    return (
      <Provider store={store}>
        <FeedbackContent context={this.props.context} />
      </Provider>
    );
  }
}
