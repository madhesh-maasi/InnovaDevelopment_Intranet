/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from "react";
import styles from "./SubdepartmentQuickLinks.module.scss";
import type { ISubdepartmentQuickLinksProps } from "./ISubdepartmentQuickLinksProps";
import CustomHeader from "../../../CommonComponents/webpartsHeader/CustomerHeader/CustomHeader";
import CustomaddBtn from "../../../CommonComponents/webpartsHeader/CustomaddBtn/CustomaddBtn";
import { togglePopupVisibility } from "../../../CommonComponents/CustomPopup/togglePopup";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../../../Redux/Store/Store";
import Popup from "../../../CommonComponents/CustomPopup/Popup";
import {
  addSubDepartmentQuickLinks,
  getSubDepartmentQuickLinks,
} from "../../../Services/DepartmentQuickLinkServi/SubDepartmentQuickLinkService";
import { sp } from "@pnp/sp";
import {
  setCurrentUserDetails,
  setMainSPContext,
  setSiteUrl,
  setTenantUrl,
  setWebUrl,
} from "../../../Redux/Features/MainSPContextSlice";
import { Toast } from "primereact/toast";
import { useEffect, useState } from "react";
import { IQuickLink } from "../../../Interface/BannerInterface";
import CustomInputField from "../../../CommonComponents/CustomInputField/CustomInputField";
import CustomMultiInputField from "../../../CommonComponents/CustomMultiInputField/CustomMultiInputField";
import CustomFileUpload from "../../../CommonComponents/CustomFileUpload/CustomFileUpload";
import Quicklinks from "../../../CommonComponents/QuickLinks/Quicklinks";
// import "../../../Config/style.css";
import "../../../Config/style.css";
import { getPermissionLevel } from "../../../Services/CommonService/CommonService";
const SubDepartmentQuickLinks: React.FC<ISubdepartmentQuickLinksProps> = ({
  context,
}) => {
  const dispatch = useDispatch();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const currentuser = useSelector(
    (state: any) => state.MainSPContext.currentUserDetails
  );
  const [subDepartmentQuickLinks, setSubDepartmentQuickLinks] = React.useState<
    IQuickLink[]
  >([]);
  const webUrl = context?.pageContext?.web?.absoluteUrl;
  const siteUrl = context?.pageContext?.site?.serverRelativeUrl;
  const tenantUrl = webUrl?.split("/sites")[0];
  const toastRef = React.useRef<any>(null);
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

    try {
      setIsLoading(true);
      const payload: IQuickLink = {
        Title,
        Link,
        Logo,
      };
      // console.log("Submitting subdepartment QuickLink:", payload);
      await addSubDepartmentQuickLinks(
        payload,
        setSubDepartmentQuickLinks,
        toastRef
      );

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
    const links = await getSubDepartmentQuickLinks();
    setSubDepartmentQuickLinks(links);
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
  return (
    <>
      <Toast ref={toastRef} position="top-right" baseZIndex={999} />
      <div className={styles.subQuickLinksContainer}>
        <div className={styles.headerSection}>
          <div style={{ width: "50%" }}>
            <CustomHeader Header="Sub-departments" />
          </div>
          <div className={styles.headerRight}>
            {isAdmin ? (
              <CustomaddBtn
                onClick={() => {
                  togglePopupVisibility(
                    setPopupController,
                    0,
                    "open",
                    `Quick Link`,
                    "30%"
                  );
                }}
              />
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className={styles.cardsContainer}>
          {subDepartmentQuickLinks.length > 0 ? (
            subDepartmentQuickLinks.map((link, i) => (
              <div key={i} className={styles.quickLinksCard}>
                <Quicklinks
                  Module="SubDepartment"
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
    </>
  );
};
export default (props: ISubdepartmentQuickLinksProps): JSX.Element => (
  <Provider store={store}>
    <SubDepartmentQuickLinks context={props.context} />
  </Provider>
);
