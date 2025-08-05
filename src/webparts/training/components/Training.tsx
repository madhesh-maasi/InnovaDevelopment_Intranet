/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import * as React from "react";
import styles from "./Training.module.scss";
import type { ITrainingProps } from "./ITrainingProps";
import { store } from "../../../Redux/Store/Store";
import { Provider, useDispatch, useSelector } from "react-redux";
import Popup from "../../../CommonComponents/CustomPopup/Popup";
import { togglePopupVisibility } from "../../../CommonComponents/CustomPopup/togglePopup";
import { DataTable } from "primereact/datatable";
import { Toast } from "primereact/toast";
import CustomHeader from "../../../CommonComponents/webpartsHeader/CustomerHeader/CustomHeader";
import CustomaddBtn from "../../../CommonComponents/webpartsHeader/CustomaddBtn/CustomaddBtn";
import CustomDataTable from "../../../CommonComponents/DataTable/DataTable";
import { Column } from "primereact/column";
import { DirectionalHint, TooltipHost } from "@fluentui/react";
import {
  setCurrentUserDetails,
  setMainSPContext,
  setSiteUrl,
  setTenantUrl,
  setWebUrl,
} from "../../../Redux/Features/MainSPContextSlice";
import CustomInputField from "../../../CommonComponents/CustomInputField/CustomInputField";
import { useEffect, useState } from "react";
import { sp } from "@pnp/sp";
import {
  addTraining,
  deleteTraining,
  FetchTrainingData,
  updateTraining,
} from "../../../Services/TrainingService/TrainingService";
import { setTraining } from "../../../Redux/Features/TrainingSlice";
import { ITrainingType } from "../../../Interface/TrainingInterface";
import CustomSearchInput from "../../../CommonComponents/webpartsHeader/CustomSearchInput/CustomSearchInput";
import "../../../Config/style.css";
import { getPermissionLevel } from "../../../Services/CommonService/CommonService";
const Training: React.FC<ITrainingProps> = ({ context }) => {
  const dispatch = useDispatch();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const currentuser = useSelector(
    (state: any) => state.MainSPContext.currentUserDetails
  );
  const [input, setInput] = React.useState<any>({
    Id: null,
    Name: "",
    URL: "",
  });
  const [deleteItemId, setDeleteItemId] = useState<any>();
  const [allData, setAllData] = React.useState<ITrainingType[]>([]);
  const [filteredData, setfilteredData] = React.useState<ITrainingType[]>([]);
  const webUrl = context?.pageContext?.web?.absoluteUrl;
  const siteUrl = context?.pageContext?.site?.serverRelativeUrl;
  const tenantUrl = webUrl?.split("/sites")[0];
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const toastRef = React.useRef<any>(null);
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
    setInput({
      Id: null,
      Name: "",
      URL: "",
    });
    setDeleteItemId(0);
  };
  const handleInputChange = (field: string, value: any) => {
    setInput((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };
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
  const getTrainingData = async () => {
    const tabledata = await FetchTrainingData();
    dispatch(setTraining(tabledata));
    setAllData(tabledata);
    setfilteredData(tabledata);
  };
  const handleSubmitFuction = async () => {
    const { Id, Name, URL } = input;
    const sameUpdate =
      isEdit &&
      allData.some((data: any) => data.Id === Id && data.Name === Name.trim());

    if (sameUpdate) {
      toastRef?.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Item updated successfully!",
        life: 3000,
      });
      handleClosePopup(0);
      return;
    }

    try {
      const missingFields = [];
      if (!Name.trim()) missingFields.push("Name");
      // if (!URL) missingFields.push("URL");
      if (missingFields.length > 0) {
        toastRef.current?.show({
          severity: "warn",
          summary: "Missing fields",
          detail: `Please enter ${missingFields.join(", ")}.`,
          life: 3000,
        });
        return;
      }
      const isDuplicate = allData?.some((data: any) => data.Name === Name);
      if (isDuplicate) {
        toastRef.current?.show({
          severity: "warn",
          summary: "Duplicate Found!",
          detail: `File aldready exists.`,
          life: 3000,
        });
        return;
      }
      setIsLoading(true);
      const payload = {
        Name: Name,
        URL: URL,
      };
      if (isEdit) {
        await updateTraining(input?.Id, payload, getTrainingData, toastRef);
      } else {
        await addTraining(payload, setAllData, dispatch, toastRef);
      }
      handleClosePopup(0);
      setInput({
        Id: null,
        Name: "",
        URL: "",
      });
    } catch (err) {
      console.error("add failed:", err);
    } finally {
      setIsLoading(false);
    }
  };
  const popupInputs: any[] = [
    [
      <div className={styles.popupCustomWrapper} key={0}>
        <CustomInputField
          label="Name"
          required={true}
          value={input.Name}
          onChange={(e: any) => handleInputChange("Name", e.target.value)}
          placeholder="Enter Name"
        />
      </div>,
    ],
    [
      <div key={1} className={styles.DeletePopupWrapper}>
        Are you sure you want to delete this item?
      </div>,
    ],
  ];
  const handleDelete = () => {
    deleteTraining(deleteItemId, setAllData, allData, toastRef);
    handleClosePopup(1);
  };
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
        },
      },
      {
        text: isEdit ? "Update" : "Submit",
        btnType: "primaryBtn",
        disabled: false,
        endIcon: false,
        startIcon: false,
        onClick: () => {
          !isLoading && handleSubmitFuction();
        },
      },
    ],
    [
      {
        text: "No",
        btnType: "closeBtn",
        disabled: false,
        endIcon: false,
        startIcon: false,
        onClick: () => {
          handleClosePopup(1);
        },
      },
      {
        text: "Yes",
        btnType: "primaryBtn",
        disabled: false,
        endIcon: false,
        startIcon: false,
        onClick: () => {
          !isLoading && handleDelete();
        },
      },
    ],
  ];
  const handleEdit = (rowData: any) => {
    setIsEdit(true);
    setInput({
      Id: rowData?.Id,
      Name: rowData.Name,
      URL: rowData.URL,
    });
    togglePopupVisibility(setPopupController, 0, "open", `Training`, "30%");
  };
  const checkPermission = async () => {
    const result = await getPermissionLevel(currentuser);
    setIsAdmin(result);
  };
  useEffect(() => {
    dispatch(setMainSPContext(context));
    setContext();
    getTrainingData();
  }, []);
  useEffect(() => {
    if (currentuser && currentuser.length > 0) {
      checkPermission();
    }
  }, [currentuser]);
  useEffect(() => {
    setfilteredData(allData);
  }, [allData]);
  return (
    <>
      <Toast ref={toastRef} position="top-right" baseZIndex={9999} />
      <div className={styles.TableOfContainer}>
        <div className={styles.headerSection}>
          <div style={{ width: "50%" }}>
            <CustomHeader Header="Training" />
          </div>
          <div className={styles.headerRight}>
            <CustomSearchInput
              placeholder="Search by Name"
              searchFunction={(value: string) => {
                let filtered;
                if (value.trim() === "") {
                  setfilteredData(allData);
                } else {
                  filtered = allData.filter((item) =>
                    item.Name.toLowerCase().includes(value.toLowerCase())
                  );
                  setfilteredData(filtered);
                }
              }}
            />
            {isAdmin ? (
              <CustomaddBtn
                onClick={() => {
                  setIsEdit(false);
                  togglePopupVisibility(
                    setPopupController,
                    0,
                    "open",
                    `Training`,
                    "30%"
                  );
                }}
              />
            ) : (
              <></>
            )}
          </div>
        </div>

        <div className="tableContentWrapper">
          <CustomDataTable
            table={
              <DataTable
                value={filteredData}
                style={{ maxWidth: "100%", padding: "20px 0px" }}
                tableStyle={{ tableLayout: "fixed" }}
                emptyMessage={
                  <div className={styles.emptyMessage}>No data found!</div>
                }
              >
                <Column
                  field="Name"
                  header="Name"
                  style={{ width: "25%" }}
                  body={(rowdata: any) => {
                    return (
                      <TooltipHost
                        content={rowdata.Name}
                        tooltipProps={{
                          directionalHint: DirectionalHint.bottomLeftEdge,
                        }}
                      >
                        <div
                          style={{
                            whiteSpace: "nowrap",
                            width: "100%",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            padding: "5px 0px",
                          }}
                        >
                          {rowdata.Name}
                        </div>
                      </TooltipHost>
                    );
                  }}
                />
                <Column
                  field="URL"
                  header="URL"
                  style={{ width: "65%" }}
                  body={(rowdata: any) => {
                    return (
                      <TooltipHost
                        content={rowdata.URL}
                        tooltipProps={{
                          directionalHint: DirectionalHint.bottomCenter,
                        }}
                      >
                        <div
                          style={{
                            whiteSpace: "nowrap",
                            width: "100%",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            padding: "5px 0px",
                            cursor: "pointer",
                          }}
                        >
                          <a
                            href={rowdata.URL + "?web=1"}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-interception="off"
                          >
                            {rowdata.URL}
                          </a>
                        </div>
                      </TooltipHost>
                    );
                  }}
                />
                {isAdmin && (
                  <Column
                    header="Action"
                    style={{ width: "10%" }}
                    body={(rowData: any) => (
                      <div style={{ display: "flex", gap: "4%" }}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1470af"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ cursor: "pointer" }}
                          className="lucide lucide-pencil-icon lucide-pencil"
                          onClick={() => handleEdit(rowData)}
                        >
                          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                          <path d="m15 5 4 4" />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="red"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ cursor: "pointer" }}
                          className="lucide lucide-trash2-icon lucide-trash-2"
                          onClick={() => {
                            setDeleteItemId(rowData?.Id);
                            togglePopupVisibility(
                              setPopupController,
                              1,
                              "open",
                              `Delete`,
                              "30%"
                            );
                          }}
                        >
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </div>
                    )}
                  />
                )}
              </DataTable>
            }
          />
          {/* <div className={styles.seeMoreWrapper}>
          <span
            onClick={() =>
              window.open(
                `${
                  window.location.origin
                }${"/sites/InnovaDevelopments/SitePages/InnovaTeamView.aspx"}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            See more
          </span>
        </div> */}
        </div>
        <div>
          {popupController?.map((popupData: any, index: number) => (
            <Popup
              key={index}
              isLoading={isLoading}
              PopupType={popupData.popupType}
              onHide={() => {
                togglePopupVisibility(setPopupController, index, "close");
                setIsEdit(false);
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
export default (props: ITrainingProps): JSX.Element => (
  <Provider store={store}>
    <Training context={props.context} />
  </Provider>
);
