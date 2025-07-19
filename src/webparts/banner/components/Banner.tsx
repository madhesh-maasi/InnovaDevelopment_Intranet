/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as React from "react";
import type { IBannerProps } from "./IBannerProps";
import "../../../Config/style.css";
import styles from "./BannerComponent.module.scss";
import { sp } from "@pnp/sp/presets/all";
import { graph } from "@pnp/graph/presets/all";
import { store } from "../../../Redux/Store/Store";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import {
  setCurrentUserDetails,
  setMainSPContext,
  setSiteUrl,
  setTenantUrl,
  setWebUrl,
} from "../../../Redux/Features/MainSPContextSlice";
import { setQuickLinks as setQuickLinksAction } from "../../../Redux/Features/QuickLinkSlice";
import { IQuickLink } from "../../../Interface/BannerInterface";
import Quicklinks from "../../../CommonComponents/QuickLinks/Quicklinks";
import { togglePopupVisibility } from "../../../CommonComponents/CustomPopup/togglePopup";
import { useEffect, useState } from "react";
import CustomInputField from "../../../CommonComponents/CustomInputField/CustomInputField";
import CustomMultiInputField from "../../../CommonComponents/CustomMultiInputField/CustomMultiInputField";
import CustomFileUpload from "../../../CommonComponents/CustomFileUpload/CustomFileUpload";
import Popup from "../../../CommonComponents/CustomPopup/Popup";
import {
  addQuickLinks,
  getQuickLinks,
} from "../../../Services/QuickLinkService/QuickLinkService";
import { getPermissionLevel } from "../../../Services/CommonService/CommonService";

const BannerContent: React.FC<IBannerProps> = ({
  context,
  userDisplayName,
}) => {
  const dispatch = useDispatch();
  const toastRef = React.useRef<any>(null);
  const [quickLinks, setQuickLinks] = React.useState<IQuickLink[]>([]);
  const webUrl = context?.pageContext?.web?.absoluteUrl;
  const siteUrl = context?.pageContext?.site?.serverRelativeUrl;
  const tenantUrl = webUrl?.split("/sites")[0];
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const currentuser = useSelector(
    (state: any) => state.MainSPContext.currentUserDetails
  );

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
      dispatch(setMainSPContext(context));
    } catch (err) {
      console.error("Error setting context:", err);
    }
  };
  const [isLoading, setIsLoading] = useState(false);
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
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };
  const [quickLinkForm, setQuickLinkForm] = useState<IQuickLink>({
    Title: "",
    Link: "",
    Logo: null as File | null,
  });
  const handleQuickLinkChange = (field: any, value: any) => {
    setQuickLinkForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleQuickLinkSubmit = async () => {
    const { Title, Link, Logo } = quickLinkForm;
    const duplicate = quickLinks?.some((data: any) => data.Title === Title);
    if (duplicate) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Duplicate Found!",
        detail: `Link name aldready exists `,
        life: 3000,
      });
      return;
    }
    const missingFields = [];
    if (!Title?.trim()) missingFields.push("Link name");
    if (!Link?.trim()) missingFields.push("Link url");
    if (!Logo) missingFields.push("Logo");

    if (missingFields.length > 0) {
      const messageDetails = [];
      if (missingFields.length === 1 && missingFields[0] === "Link name") {
        messageDetails.push("please enter link name before submitting");
      } else if (
        missingFields.length === 1 &&
        missingFields[0] === "Link url"
      ) {
        messageDetails.push("please enter link url before submitting");
      } else if (missingFields.length === 1 && missingFields[0] === "Logo") {
        messageDetails.push("please upload logo before submitting");
      }
      toastRef.current?.show({
        severity: "warn",
        summary: "Missing fields",
        detail:
          missingFields.length === 1
            ? messageDetails
            : `Please enter/upload ${missingFields.join(
                ", "
              )} before submitting.`,
        life: 3000,
      });
      return;
    }
    // if (!Title && !Link && !Logo) {
    //   toastRef.current?.show({
    //     severity: "warn",
    //     summary: "Missing fields",
    //     detail: `Please enter Title,Link and Upload logo before submitting`,
    //     life: 3000,
    //   });
    //   return;
    // }
    // if (!Logo) {
    //   toastRef.current?.show({
    //     severity: "warn",
    //     summary: "Missing fields",
    //     detail: `Please upload logo before submitting`,
    //     life: 3000,
    //   });
    //   return;
    // }
    let userInputUrl = Link.trim();
    if (
      !userInputUrl.startsWith("http://") &&
      !userInputUrl.startsWith("https://") &&
      userInputUrl.length >= 6
    ) {
      userInputUrl = `https://${userInputUrl}`;
    }
    if (userInputUrl && Title.trim() !== "") {
      const isValid = isValidUrl(userInputUrl);
      if (!isValid) {
        toastRef.current?.show({
          severity: "warn",
          summary: "Missing fields",
          detail: "Please enter a valid URL",
          life: 3000,
        });
        return;
      }
    }
    try {
      setIsLoading(true);
      const payload: IQuickLink = {
        Title,
        Link: userInputUrl,
        Logo,
      };
      // console.log("Submitting QuickLink:", payload);
      await addQuickLinks(payload, setQuickLinks, dispatch, toastRef);
      handleClosePopup(0);
      setQuickLinkForm({
        Title: "",
        Link: "",
        Logo: null,
      });
    } catch (err) {
      console.error("QuickLink submission failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const popupInputs: any[] = [
    [
      <>
        <div className={styles.customwrapper}>
          <CustomInputField
            label="Link name*"
            value={quickLinkForm.Title}
            onChange={(e: any) =>
              handleQuickLinkChange("Title", e.target.value)
            }
            placeholder="Enter link name"
          />
        </div>

        <div className={styles.customwrapper}>
          <CustomMultiInputField
            label="Link url*"
            value={quickLinkForm.Link}
            onChange={(e: any) => handleQuickLinkChange("Link", e.target.value)}
            rows={1}
            placeholder="Enter link url"
            autoResize={false}
          />
        </div>

        <div className={styles.customwrapper}>
          <CustomFileUpload
            accept="image/*"
            label="Upload logo*"
            onFileSelect={(file: File) => handleQuickLinkChange("Logo", file)}
          />
          {quickLinkForm.Logo && (
            <div style={{ marginTop: "10px", fontWeight: 400 }}>
              Selected File: {quickLinkForm.Logo.name}
            </div>
          )}
        </div>
      </>,
    ],
  ];
  const popupActions: any[] = [
    [
      {
        text: "Cancel",
        btnType: "closeBtn",
        disabled: false,
        onClick: () => {
          !isLoading && handleClosePopup(0);
          setQuickLinkForm({
            Title: "",
            Link: "",
            Logo: null,
          });
        },
      },
      {
        text: "Submit",
        btnType: "primaryBtn",
        disabled: false,
        onClick: () => {
          !isLoading && handleQuickLinkSubmit();
        },
      },
    ],
  ];

  const fetchQuickLinks = async () => {
    const links = await getQuickLinks();
    setQuickLinks(links);
    dispatch(setQuickLinksAction(links));
  };
  const checkPermission = async () => {
    const result = await getPermissionLevel(currentuser);
    setIsAdmin(result);
  };
  useEffect(() => {
    setContext();
    fetchQuickLinks();
  }, []);

  useEffect(() => {
    if (currentuser && currentuser.length > 0) {
      checkPermission();
    }
  }, [currentuser]);

  const description =
    "We're glad to have you here. Explore, collaborate, and stay connected with everything you need in one place. If you need help, feel free to reach out!";

  return (
    <div className={styles.bannerContainer}>
      <Toast ref={toastRef} />
      <div className={styles.welcomeCardContainer}>
        <div style={{ width: "5%" }} />
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeNote}>Welcome, {userDisplayName}!</div>
          <div className={styles.description}>{description}</div>
        </div>
      </div>
      <div className={styles.quickLinkContainer}>
        <div style={{ width: "100%" }}>
          <div className={styles.quickLinkHeader}>
            <div>
              <u>Quick links</u>
            </div>
            {isAdmin ? (
              <div
                className={styles.addbtn}
                onClick={() => {
                  togglePopupVisibility(
                    setPopupController,
                    0,
                    "open",
                    `Quick Link`,
                    "30%"
                  );
                }}
              >
                <i className="fa-solid fa-plus" />
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="quickLinkcardsContainer">
            {quickLinks.length > 0 ? (
              quickLinks.map((link, i) => (
                <div key={i} className={styles.quickLinksCard}>
                  <Quicklinks
                    Title={link.Title}
                    Link={link.Link}
                    Logo={link.Logo}
                  />
                </div>
              ))
            ) : (
              <div className={styles.noRecords}>No Links Found</div>
            )}
          </div>
        </div>
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

export default class Banner extends React.Component<IBannerProps, {}> {
  constructor(prop: IBannerProps) {
    super(prop);
    sp.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
    graph.setup({
      spfxContext: this.props.context as unknown as undefined,
    });
  }

  public render(): React.ReactElement<IBannerProps> {
    return (
      <Provider store={store}>
        <BannerContent
          context={this.props.context}
          userDisplayName={this.props.userDisplayName}
        />
      </Provider>
    );
  }
}
