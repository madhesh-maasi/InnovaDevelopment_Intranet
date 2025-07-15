/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from "react";
import styles from "./TableofContent.module.scss";
import type { ITableofContentProps } from "./ITableofContentProps";
import { sp } from "@pnp/sp/presets/all";
// import { graph } from "@pnp/graph/presets/all";
import { Provider, useDispatch } from "react-redux";
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
import { useState } from "react";
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
import "../assets/css/style.css";
const TableOfContent: React.FC<ITableofContentProps> = ({ context }) => {
  const dispatch = useDispatch();
  const [input, setInput] = React.useState<any>({
    Id: null,
    RoleGuide: "",
    DepartmentProcess: "",
    SOP: "",
  });
  const [deleteItemId, setDeleteItemId] = useState<any>();
  const [allData, setAllData] = React.useState<ITableOfContentType[]>([]);
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
  };
  const handleSubmitFuction = async () => {
    setIsLoading(true);
    const { RoleGuide, DepartmentProcess } = input;

    try {
      if (!RoleGuide || !DepartmentProcess) {
        toastRef.current?.show({
          severity: "warn",
          summary: "Missing Fields",
          detail: "Please fill out all required fields before submitting.",
          life: 3000,
        });
        return;
      }
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
          label="Department Process*"
          value={input.DepartmentProcess}
          onChange={(e: any) =>
            handleInputChange("DepartmentProcess", e.target.value)
          }
          rows={2}
          placeholder=" Enter Department Process"
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
          handleSubmitFuction();
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
          handleDelete();
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
  React.useEffect(() => {
    dispatch(setMainSPContext(context));
    setContext();
    getTableOfContentData();
  }, []);

  return (
    <>
      <Toast ref={toastRef} position="top-right" baseZIndex={1} />
      <div className={styles.TableOfContainer}>
        <div className={styles.headerSection}>
          <div style={{ width: "50%" }}>
            <CustomHeader Header="Table of content" />
          </div>
          <div className={styles.headerRight}>
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
          </div>
        </div>

        <div className={styles.tableContentWrapper}>
          <CustomDataTable
            table={
              <DataTable
                value={allData}
                style={{ width: "100%", padding: "20px" }}
                tableStyle={{ tableLayout: "fixed" }}
              >
                <Column
                  field="RoleGuide"
                  header="Role guide"
                  style={{ width: "20%" }}
                />
                <Column
                  field="DepartmentProcess"
                  header="Department Process"
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
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
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
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
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
                      {/* <button 
                    // onClick={() => handleEdit(rowData)}
                    >✏️</button>
                    <button
                    //  onClick={() => handleDelete(rowData)}
                      >🗑️</button> */}
                    </div>
                  )}
                />
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
