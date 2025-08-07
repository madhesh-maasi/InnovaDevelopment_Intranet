/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import * as React from "react";
import type { IInnovaTeamViewProps } from "./IInnovaTeamViewProps";
import styles from "./InnovaTeamView.module.scss";

import { sp } from "@pnp/sp/presets/all";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../../../Redux/Store/Store";
// import "../assets/css/style.css";
import "../../../Config/style.css";
import {
  setCurrentUserDetails,
  setMainSPContext,
  setSiteUrl,
  setTenantUrl,
  setWebUrl,
} from "../../../Redux/Features/MainSPContextSlice";
import { setInnovaTeam } from "../../../Redux/Features/InnovaTeamSlice";

import FetchInnovaTeamData, {
  _getUserDetails,
  addInnovaTeam,
} from "../../../Services/InnovaTeamService/InnovaTeamService";
import { IInnovaTeamType } from "../../../Interface/InnovaTeamInterface";
import { IUserDetails } from "../../../Interface/CommonInterface";

import CustomHeader from "../../../CommonComponents/webpartsHeader/CustomerHeader/CustomHeader";
import CustomDropdown from "../../../CommonComponents/CustomDropdown/CustomDropdown";
import CustomPeoplePicker from "../../../CommonComponents/CustomPeoplePicker/CustomPeoplePicker";
// import CustomaddBtn from "../../../CommonComponents/webpartsHeader/CustomaddBtn/CustomaddBtn";
import CustomDataTable from "../../../CommonComponents/DataTable/DataTable";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Profile from "../../../CommonComponents/Profile/Profile";
import { useEffect, useState } from "react";
import { togglePopupVisibility } from "../../../CommonComponents/CustomPopup/togglePopup";
import Popup from "../../../CommonComponents/CustomPopup/Popup";
import CustomInputField from "../../../CommonComponents/CustomInputField/CustomInputField";
import CustomMultiInputField from "../../../CommonComponents/CustomMultiInputField/CustomMultiInputField";
import { DirectionalHint, TooltipHost } from "@fluentui/react";
import CustomaddBtn from "../../../CommonComponents/webpartsHeader/CustomaddBtn/CustomaddBtn";
import { getPermissionLevel } from "../../../Services/CommonService/CommonService";
import { Toast } from "primereact/toast";

const InnovaTeamContent: React.FC<IInnovaTeamViewProps> = ({ context }) => {
  const dispatch = useDispatch();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const currentuser = useSelector(
    (state: any) => state.MainSPContext.currentUserDetails
  );

  const toastRef = React.useRef<any>(null);
  const [role, setRole] = React.useState<string | undefined>();
  const [input, setInput] = React.useState<any>({
    selectedUser: null,
    role: "",
    jobDescription: "",
  });
  const [allData, setAllData] = React.useState<IInnovaTeamType[]>([]);
  const [tableData, setTableData] = React.useState<IInnovaTeamType[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<IUserDetails[]>([]);

  const webUrl = context?.pageContext?.web?.absoluteUrl;
  const siteUrl = context?.pageContext?.site?.serverRelativeUrl;
  const tenantUrl = webUrl?.split("/sites")[0];
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

  const getOptions = (): string[] => {
    const roles = allData
      .map((item) => item?.Role)
      .filter(
        (role): role is string => typeof role === "string" && role.trim() !== ""
      );
    return ["All", ...Array.from(new Set(roles))];
  };

  const onUserSelect = async (users: any, filter: boolean) => {
    const user = users?.[0];
    // console.log(user);

    if (!user) {
      setSelectedUser([]);
      setInput({
        ...input,
        selectedUser: null,
        role: "",
        // jobDescription: "",
      });
    }

    if (filter) {
      setSelectedUser(users);
      if (user?.Email) {
        const filtered = allData.filter(
          (item) => item?.TeamMember?.Email === user.Email
        );
        setTableData(filtered);
      } else {
        setTableData(allData);
      }
    } else {
      const isDuplicate = allData.some(
        (item) =>
          item?.TeamMember?.Email?.toLowerCase() === user.Email?.toLowerCase()
      );

      if (isDuplicate) {
        toastRef.current?.show({
          severity: "warn",
          summary: "Duplicate User",
          detail: "User is already in the team.",
          life: 3000,
        });
        setSelectedUser([]);
        return;
      }
      await _getUserDetails(user, setInput, context);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setInput((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };
  const onChangeFunction = (selectedRole: string) => {
    setRole(selectedRole);
    if (!selectedRole || selectedRole === "All") {
      setTableData(allData);
      return;
    }
    const filtered = allData.filter((item) => item.Role === selectedRole);
    setTableData(filtered);
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
  const getInnovaTeamData = async () => {
    const teamdata = await FetchInnovaTeamData();
    dispatch(setInnovaTeam(teamdata));
    setAllData(teamdata);
    setTableData(teamdata);
  };
  const handleSubmitFuction = async () => {
    const { selectedUser, role, jobDescription } = input;
    // console.log("Input", input);

    const missingFields = [];
    if (!role) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Wrong member",
        detail: "Please select valid Team member",
        life: 3000,
      });
      return;
    }
    const trimmedJobDescription = jobDescription.trim();

    if (!selectedUser) missingFields.push("Team member");
    if (!trimmedJobDescription) missingFields.push("Job description");
    if (missingFields.length === 1) {
      const field = missingFields[0];
      const detailMessage =
        field === "Team member"
          ? "Please select team member ."
          : `Please enter ${field.toLowerCase()}.`;

      toastRef.current?.show({
        severity: "warn",
        summary: "Missing field",
        detail: detailMessage,
        life: 3000,
      });
      return;
    }
    if (missingFields.length > 0) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Missing fields",
        detail: `Please enter ${missingFields.join(", ")}.`,
        life: 3000,
      });
      return;
    }
    // console.log(selectedUser, "user");
    try {
      setIsLoading(true);
      const payload = {
        Title: role,
        TeamMember: selectedUser,
        JobDescription: jobDescription,
      };
      await addInnovaTeam(payload, setTableData, dispatch, toastRef);
      await getInnovaTeamData();
      handleClosePopup(0);
      setInput({
        selectedUser: null,
        role: "",
        jobDescription: "",
      });
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsLoading(false);
    }
  };
  const popupInputs: any[] = [
    [
      <div className={styles.popupCustomWrapper} key={0}>
        <CustomPeoplePicker
          label="Team member"
          required={true}
          selectedItem={selectedUser}
          personSelectionLimit={1}
          onChange={onUserSelect}
          filter={false}
          placeholder="Select user"
        />
        <CustomInputField
          label="Role"
          required={true}
          value={input.role}
          readonly={true}
          disabled={true}
          placeholder="Role"
        />
        <CustomMultiInputField
          label="Job description"
          required={true}
          value={input.jobDescription}
          onChange={(e: any) =>
            handleInputChange("jobDescription", e.target.value)
          }
          rows={3}
          placeholder="Job description"
          autoResize={false}
        />
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
          setInput({
            selectedUser: null,
            role: "",
            jobDescription: "",
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
  const truncateText = (text: any, maxLength: any) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength - 3) + "...";
    }
    return text;
  };
  const checkPermission = async () => {
    const result = await getPermissionLevel(currentuser);
    setIsAdmin(result);
  };
  useEffect(() => {
    dispatch(setMainSPContext(context));
    setContext();
    getInnovaTeamData();
  }, []);
  useEffect(() => {
    if (currentuser && currentuser.length > 0) {
      checkPermission();
    }
  }, [currentuser]);
  return (
    <>
      <Toast ref={toastRef} position="top-right" baseZIndex={1} />
      <div className={styles.innovaTeamContainer}>
        <div className={styles.headerSection}>
          <div style={{ width: "50%" }}>
            <CustomHeader Header="Innova Team" />
          </div>
          <div className={styles.headerRight}>
            <div style={{ width: "180px" }}>
              <CustomDropdown
                value={role}
                options={getOptions()}
                onChange={onChangeFunction}
                placeholder="Role"
              />
            </div>
            <div style={{ width: "180px", height: "100%" }}>
              <CustomPeoplePicker
                selectedItem={selectedUser}
                personSelectionLimit={1}
                onChange={onUserSelect}
                filter={true}
                placeholder="Search By User"
              />
            </div>
            {isAdmin ? (
              <CustomaddBtn
                onClick={() => {
                  setSelectedUser([]);
                  togglePopupVisibility(
                    setPopupController,
                    0,
                    "open",
                    `Add Role`,
                    "30%"
                  );
                }}
              />
            ) : (
              <></>
            )}
            {/* <CustomaddBtn
            onClick={() => {
              togglePopupVisibility(
                setPopupController,
                0,
                "open",
                `Add Role`,
                "30%"
              );
            }}
          /> */}
          </div>
        </div>

        <div className="viewDatatablewrapper">
          <CustomDataTable
            table={
              <DataTable
                value={tableData}
                style={{ minWidth: "100%", padding: "20px 0px" }}
                emptyMessage={"No records found"}
              >
                <Column
                  header="Team member"
                  style={{ width: "25%" }}
                  body={(rowData) => (
                    <Profile TeamMember={rowData?.TeamMember} />
                  )}
                />
                <Column
                  header="E-Mail"
                  style={{ width: "25%", fontSize: "12px" }}
                  body={(rowData: any) => {
                    const email = rowData?.TeamMember?.Email;
                    return (
                      <div className={styles.bodyWrapper}>
                        <a
                          href={`mailto:${email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {email}
                        </a>
                      </div>
                    );
                  }}
                />

                <Column
                  header="Role"
                  style={{ width: "25%" }}
                  body={(rowData: any) => (
                    <div className={styles.bodyWrapper}>{rowData?.Role}</div>
                  )}
                />
                <Column
                  header="Job description"
                  style={{ width: "25%" }}
                  body={(rowdata: any) => {
                    return (
                      <TooltipHost
                        content={rowdata.JobDescription}
                        tooltipProps={{
                          directionalHint: DirectionalHint.bottomCenter,
                        }}
                      >
                        <div className={styles.jobDescriptionWrapper}>
                          <p> {truncateText(rowdata.JobDescription, 85)}</p>
                        </div>
                      </TooltipHost>
                    );
                  }}
                />
              </DataTable>
            }
          />
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

export default (props: IInnovaTeamViewProps): JSX.Element => (
  <Provider store={store}>
    <InnovaTeamContent context={props.context} />
  </Provider>
);
