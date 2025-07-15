/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */

import * as React from "react";
import type { IBannerProps } from "./IBannerProps";
import "../assets/css/style.css";
import "../../../Config/style.css";
import styles from "./BannerComponent.module.scss";
import { sp } from "@pnp/sp/presets/all";
import { graph } from "@pnp/graph/presets/all";
import { store } from "../../../Redux/Store/Store";
import { Provider, useDispatch } from "react-redux";
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
import { useState } from "react";
import CustomInputField from "../../../CommonComponents/CustomInputField/CustomInputField";
import CustomMultiInputField from "../../../CommonComponents/CustomMultiInputField/CustomMultiInputField";
import CustomFileUpload from "../../../CommonComponents/CustomFileUpload/CustomFileUpload";
import Popup from "../../../CommonComponents/CustomPopup/Popup";
import {
  addQuickLinks,
  getQuickLinks,
} from "../../../Services/QuickLinkService/QuickLinkService";

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

    if (!Title || !Link || !Logo) {
      console.error("All fields are required.");
      toastRef.current?.show({
        severity: "warn",
        summary: "Missing Fields",
        detail: " please fill all the required fields before submitting",
        life: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      const payload: IQuickLink = {
        Title,
        Link,
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
            label="Link Name*"
            value={quickLinkForm.Title}
            onChange={(e: any) =>
              handleQuickLinkChange("Title", e.target.value)
            }
            placeholder="Enter link name"
          />
        </div>

        <div className={styles.customwrapper}>
          <CustomMultiInputField
            label="Link URL*"
            value={quickLinkForm.Link}
            onChange={(e: any) => handleQuickLinkChange("Link", e.target.value)}
            rows={1}
            placeholder="Enter link URL"
            autoResize={false}
          />
        </div>

        <div className={styles.customwrapper}>
          <CustomFileUpload
            accept="image/*"
            label="Upload Logo*"
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
          handleClosePopup(0);
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
          handleQuickLinkSubmit();
        },
      },
    ],
  ];

  const fetchQuickLinks = async () => {
    const links = await getQuickLinks();
    setQuickLinks(links);
    dispatch(setQuickLinksAction(links));
  };

  React.useEffect(() => {
    setContext();
    fetchQuickLinks();
  }, []);

  const description =
    "We're glad to have you here. Explore, collaborate, and stay connected with everything you need in one place. If you need help, feel free to reach out!";

  return (
    <div className={styles.bannerContainer}>
      <Toast ref={toastRef} />
      <div className={styles.welcomeCardContainer}>
        <div style={{ width: "5%" }}></div>
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
              <i className="fa-solid fa-plus"></i>
            </div>
          </div>
          <div className={styles.quickLinkcardsContainer}>
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
