/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react";
import type { IMeetingProps } from "./IMeetingProps";
import { sp } from "@pnp/sp";
import { graph } from "@pnp/graph";
import { Provider, useDispatch } from "react-redux";
import { store } from "../../../Redux/Store/Store";
import {
  setCurrentUserDetails,
  setMainSPContext,
  setSiteUrl,
  setTenantUrl,
  setWebUrl,
} from "../../../Redux/Features/MainSPContextSlice";
import { togglePopupVisibility } from "../../../CommonComponents/CustomPopup/togglePopup";
import Popup from "../../../CommonComponents/CustomPopup/Popup";
import styles from "./Meeting.module.scss";
import CustomDropdown from "../../../CommonComponents/CustomDropdown/CustomDropdown";
import CustomInputField from "../../../CommonComponents/CustomInputField/CustomInputField";
import CustomMultiInputField from "../../../CommonComponents/CustomMultiInputField/CustomMultiInputField";
import CustomFileUpload from "../../../CommonComponents/CustomFileUpload/CustomFileUpload";
import CustomHeader from "../../../CommonComponents/webpartsHeader/CustomerHeader/CustomHeader";
import CustomaddBtn from "../../../CommonComponents/webpartsHeader/CustomaddBtn/CustomaddBtn";
import { useEffect, useState } from "react";
import {
  addToMeetingList,
  FetchMeetingsData,
  uploadToMeetingAttachments,
} from "../../../Services/MeetingService/MeetingService";
import { setMeetingItem } from "../../../Redux/Features/MeetingSlice";
import { IMeetingItem } from "../../../Interface/MeetingInterface";
import * as moment from "moment";

const MeetingContent: React.FC<IMeetingProps> = ({ context }) => {
  const dispatch = useDispatch();
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
      // Removed dispatch(setMainSPContext(context)) to avoid non-serializable in Redux
    } catch (err) {
      console.error("Error setting context:", err);
    }
  };

  const initialPopupController = [
    {
      open: false,
      popupTitle: "",
      popupWidth: "50%",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
    },
    {
      open: false,
      popupTitle: "",
      popupWidth: "50%",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
    },
  ];
  const [popupController, setPopupController] = useState(
    initialPopupController
  );
  const handleClosePopup = (index: number): void => {
    togglePopupVisibility(setPopupController, index, "close");
  };

  const [formData, setFormData] = useState({
    fileType: "",
    linkName: "",
    linkUrl: "",
    videoFile: null as File | null,
  });
  const [meetingData, setMeetingsData] = useState<IMeetingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const videoImgUrl = require("../assets/Video.png");
  const linkImgUrl = require("../assets/Link.png");

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getOptions = () => {
    return ["Video", "Link"];
  };

  const loadMeetings = async () => {
    try {
      const data = await FetchMeetingsData();
      dispatch(setMeetingItem(data));
      setMeetingsData(data);
    } catch (err) {
      console.error("Failed to load meetings:", err);
    }
  };

  const handleSubmitFuction = async () => {
    setIsLoading(true);
    const { fileType, videoFile, linkName, linkUrl } = formData;

    try {
      if (fileType === "Video") {
        if (!videoFile) {
          console.error("No video file selected.");
          return;
        }

        const file = await uploadToMeetingAttachments(videoFile);
        if (file) {
          await addToMeetingList(file, setMeetingsData, dispatch);
          await loadMeetings();
          handleClosePopup(0);
        } else {
          console.error("Upload failed - file metadata not returned.");
        }
      } else if (fileType === "Link") {
        if (!linkUrl || !linkName) {
          console.error("Link name or URL is missing.");
          return;
        }

        const payload = {
          FileType: "Link",
          FileUrl: linkUrl,
          FileName: linkName,
          Id: null,
        };
        await addToMeetingList(payload, setMeetingsData, dispatch);
        await loadMeetings();
        handleClosePopup(0);
      }

      setFormData({
        fileType: "",
        videoFile: null,
        linkName: "",
        linkUrl: "",
      });
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const popupInputs: any[] = [
    [
      <>
        <div className={styles.custompickerwrapper}>
          <CustomDropdown
            value={formData.fileType}
            options={getOptions().map((type) => ({ label: type, value: type }))}
            onChange={(value: any) => handleFormChange("fileType", value)}
            placeholder="Select Type"
          />
        </div>

        {formData?.fileType === "Link" && (
          <div className={styles.linkWrapper}>
            <div className={styles.customwrapper}>
              <CustomInputField
                label="Link Name"
                value={formData.linkName}
                onChange={(e: any) =>
                  handleFormChange("linkName", e.target.value)
                }
                placeholder="Link Name"
              />
            </div>
            <div className={styles.customwrapper}>
              <CustomMultiInputField
                label="Link URL"
                value={formData.linkUrl}
                onChange={(e: any) =>
                  handleFormChange("linkUrl", e.target.value)
                }
                rows={2}
                placeholder="Link Url"
                autoResize={false}
              />
            </div>
          </div>
        )}

        {formData?.fileType === "Video" && (
          <div className={styles.customwrapper}>
            <CustomFileUpload
              accept="video/*"
              label="Upload Video"
              onFileSelect={(file: File) => handleFormChange("videoFile", file)}
            />
            {formData.videoFile && (
              <div style={{ marginTop: "10px", fontWeight: 500 }}>
                Selected File: {formData.videoFile.name}
              </div>
            )}
          </div>
        )}
      </>,
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
            fileType: "",
            videoFile: null,
            linkName: "",
            linkUrl: "",
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
          handleSubmitFuction();
        },
      },
    ],
  ];

  useEffect(() => {
    setContext();
    dispatch(setMainSPContext(context));
    loadMeetings();
  }, []);

  return (
    <div className={styles.meetingContainer}>
      <div className={styles["header-wrapper"]}>
        <CustomHeader Header={"Meeting"} />
        <CustomaddBtn
          onClick={() => {
            togglePopupVisibility(
              setPopupController,
              0,
              "open",
              `Meeting`,
              "30%"
            );
          }}
        />
      </div>
      <div className={styles.meetingCardsContainer}>
        {meetingData.length > 0 ? (
          <>
            <div style={{ overflow: "auto" }}>
              {meetingData.map((item, index) => (
                <div key={index} className={styles.meetingCard}>
                  <div className={styles.img}>
                    {item.Type === "Video" ? (
                      <img
                        src={videoImgUrl}
                        width="35px"
                        height="35px"
                        alt="Video"
                      />
                    ) : (
                      <img
                        src={linkImgUrl}
                        width="35px"
                        height="35px"
                        alt="Link"
                      />
                    )}
                  </div>
                  <div className={styles.details}>
                    <div className={styles.type}>
                      <a href={item?.FileUrl} target="_blank" rel="noreferrer">
                        {item.Type === "Video"
                          ? item?.FileName || "Video"
                          : item.FileName || "Link"}
                      </a>
                    </div>
                    <div className={styles.date}>
                      {moment(item?.Date).format("YYYY-MM-DD HH:mm:ss")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div
              className={styles.seeMoreWrapper}
              onClick={() =>
                window.open(
                  "https://www.google.com",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              See more
            </div>
          </>
        ) : (
          <div className={styles.noRecords}>No Records Found</div>
        )}
      </div>
      <div>
        {popupController?.map((popupData: any, index: number) => (
          <Popup
            key={index}
            isLoading={isLoading}
            PopupType={popupData.popupType}
            onHide={() => {
              togglePopupVisibility(setPopupController, index, "close");
            }}
            popupTitle={
              popupData.popupType !== "confimation" && popupData.popupTitle
            }
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
  );
};

export default class Meeting extends React.Component<IMeetingProps, {}> {
  constructor(prop: IMeetingProps) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
    graph.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
  }
  public render(): React.ReactElement<IMeetingProps> {
    return (
      <Provider store={store}>
        <MeetingContent context={this.props.context} />
      </Provider>
    );
  }
}
