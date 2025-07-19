/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */

import * as React from "react";
import styles from "./TableofContent.module.scss";
import type { ITableofContentProps } from "./ITableofContentProps";
import { sp } from "@pnp/sp/presets/all";
// import { graph } from "@pnp/graph/presets/all";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../../../Redux/Store/Store";
import {
  setCurrentUserDetails,
  setMainSPContext,
  setSiteUrl,
  setTenantUrl,
  setWebUrl,
} from "../../../Redux/Features/MainSPContextSlice";
import { Toast } from "primereact/toast";
import CustomHeader from "../../../CommonComponents/webpartsHeader/CustomerHeader/CustomHeader";
import CustomaddBtn from "../../../CommonComponents/webpartsHeader/CustomaddBtn/CustomaddBtn";
import CustomDataTable from "../../../CommonComponents/DataTable/DataTable";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useEffect, useState } from "react";
import { togglePopupVisibility } from "../../../CommonComponents/CustomPopup/togglePopup";
import Popup from "../../../CommonComponents/CustomPopup/Popup";
import CustomInputField from "../../../CommonComponents/CustomInputField/CustomInputField";
import CustomMultiInputField from "../../../CommonComponents/CustomMultiInputField/CustomMultiInputField";
import { ITableOfContentType } from "../../../Interface/TableOfContentInterface";
import {
  addTableOfContent,
  deleteTableOfContent,
  FetchTableOfContentData,
  updateTableOfContent,
} from "../../../Services/TableOfContentService/TableOfContentService";
import { setTableOfContent } from "../../../Redux/Features/TableOfContentSlice";
import { DirectionalHint, TooltipHost } from "@fluentui/react";
import "../../../Config/style.css";
import CustomSearchInput from "../../../CommonComponents/webpartsHeader/CustomSearchInput/CustomSearchInput";
import { getPermissionLevel } from "../../../Services/CommonService/CommonService";
// import "../assets/css/style.css";
const TableOfContent: React.FC<ITableofContentProps> = ({ context }) => {
  const dispatch = useDispatch();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const currentuser = useSelector(
    (state: any) => state.MainSPContext.currentUserDetails
  );
  const [input, setInput] = React.useState<any>({
    Id: null,
    RoleGuide: "",
    DepartmentProcess: "",
    SOP: "",
  });
  const [deleteItemId, setDeleteItemId] = useState<any>();
  const [allData, setAllData] = React.useState<ITableOfContentType[]>([]);
  const [filteredData, setfilteredData] = React.useState<ITableOfContentType[]>(
    []
  );
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
      RoleGuide: "",
      DepartmentProcess: "",
      SOP: "",
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
  const getTableOfContentData = async () => {
    const tabledata = await FetchTableOfContentData();
    dispatch(setTableOfContent(tabledata));
    setAllData(tabledata);
    setfilteredData(tabledata);
  };
  const handleSubmitFuction = async () => {
    const { RoleGuide, DepartmentProcess } = input;

    const duplicate = allData?.some(
      (data: any) => data.RoleGuide === RoleGuide
    );

    if (duplicate) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Duplicate Found!",
        detail: `File aldready exists `,
        life: 3000,
      });
      return;
    }
    try {
      const missingFields = [];
      if (!RoleGuide.trim()) missingFields.push("Role guide");
      if (!DepartmentProcess.trim()) missingFields.push("Department process");
      if (missingFields.length > 0) {
        toastRef.current?.show({
          severity: "warn",
          summary: "Missing fields",
          detail: `Please enter ${missingFields.join(", ")} before submitting.`,
          life: 3000,
        });
        return;
      }
      setIsLoading(true);
      const payload = {
        RoleGuide: RoleGuide,
        DepartmentProcess: DepartmentProcess,
      };
      if (isEdit) {
        await updateTableOfContent(
          input?.Id,
          payload,
          getTableOfContentData,
          toastRef
        );
      } else {
        await addTableOfContent(payload, setAllData, dispatch, toastRef);
      }
      handleClosePopup(0);
      setInput({
        Id: null,
        RoleGuide: "",
        DepartmentProcess: "",
        SOP: "",
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
          label="Role guide*"
          value={input.RoleGuide}
          onChange={(e: any) => handleInputChange("RoleGuide", e.target.value)}
          placeholder="Enter Role Guide"
        />
        <CustomMultiInputField
          label="Department process*"
          value={input.DepartmentProcess}
          onChange={(e: any) =>
            handleInputChange("DepartmentProcess", e.target.value)
          }
          rows={2}
          placeholder=" Enter department process"
          autoResize={false}
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
    deleteTableOfContent(deleteItemId, setAllData, allData, toastRef);
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
          !isLoading && handleClosePopup(0);
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
          !isLoading && handleClosePopup(1);
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
      RoleGuide: rowData?.RoleGuide,
      DepartmentProcess: rowData?.DepartmentProcess,
      SOP: rowData?.SOP,
    });
    togglePopupVisibility(
      setPopupController,
      0,
      "open",
      `Table of content`,
      "30%"
    );
  };
  const checkPermission = async () => {
    const result = await getPermissionLevel(currentuser);
    setIsAdmin(result);
  };
  useEffect(() => {
    dispatch(setMainSPContext(context));
    setContext();
    getTableOfContentData();
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
            <CustomHeader Header="Table of content" />
          </div>
          <div className={styles.headerRight}>
            <CustomSearchInput
              placeholder="Search by role guide"
              searchFunction={(value: string) => {
                let filtered;
                if (value.trim() === "") {
                  setfilteredData(allData);
                } else {
                  filtered = allData.filter((item) =>
                    item.RoleGuide.toLowerCase().includes(value.toLowerCase())
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
                    `Table of content`,
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
              >
                <Column
                  field="RoleGuide"
                  header="Role guide"
                  style={{ width: "20%" }}
                />
                <Column
                  field="DepartmentProcess"
                  header="Department process"
                  style={{ width: "35%" }}
                  body={(rowdata: any) => {
                    return (
                      <TooltipHost
                        content={rowdata.DepartmentProcess}
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
                          }}
                        >
                          {rowdata.DepartmentProcess}
                        </div>
                      </TooltipHost>
                    );
                  }}
                />
                <Column
                  field="SOP"
                  header="SOP"
                  style={{ width: "35%" }}
                  body={(rowdata: any) => {
                    return (
                      <TooltipHost
                        content={rowdata.SOP}
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
                            href={rowdata.SOP + "?web=1"}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-interception="off"
                          >
                            {rowdata.SOP}
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
                      <div style={{ display: "flex", gap: "10%" }}>
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

export default (props: ITableofContentProps): JSX.Element => (
  <Provider store={store}>
    <TableOfContent context={props.context} />
  </Provider>
);
