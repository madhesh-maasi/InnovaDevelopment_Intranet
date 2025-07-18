import { SPLists } from "../../Config/config";
import { peopleHandler } from "../CommonService/CommonService";
import SpServices from "../SPServices/SpServices";
import { setInnovaTeam } from "../../Redux/Features/InnovaTeamSlice";

const addInnovaTeam = async (
  payload: any,
  setTableData: any,
  dispatch: any,
  toastRef?: any
) => {
  const requestPayload = {
    Title: payload.Title,
    TeamMemberId: payload?.TeamMember?.Id,
    JobDescription: payload?.JobDescription,
  };
  await SpServices.SPAddItem({
    Listname: SPLists.InnovaTeamList,
    RequestJSON: requestPayload,
  });
  const localStateData = {
    TeamMember: peopleHandler([payload?.TeamMember]),
    Role: payload.FileName,
    JobDescription: payload.FileUrl,
  };
  setTableData((prev: any[]) => [localStateData, ...prev]);
  dispatch(setInnovaTeam(localStateData));
  toastRef?.current?.show({
    severity: "success",
    summary: "Success",
    detail: "Details added successfully!",
    life: 3000,
  });
};
const FetchInnovaTeamData = async (Type?: any) => {
  const isView = Type === "View";

  const TeamData = await SpServices.SPReadItems({
    Listname: SPLists.InnovaTeamList,
    Expand: "TeamMember",
    Select: "*,TeamMember/ID,TeamMember/EMail,TeamMember/Title",
    Orderby: "ID",
    Orderbydecorasc: false,
    Topcount: isView ? 5000 : 5000,
  });
  const formatted = TeamData.map((data: any) => {
    return {
      TeamMember: peopleHandler([data?.TeamMember]),
      Role: data?.Title,
      JobDescription: data?.JobDescription,
    };
  });
  return formatted;
};
const _getUserDetails = async (
  users: any,
  setInput: React.Dispatch<React.SetStateAction<any>>,
  context: any
): Promise<void> => {
  try {
    const _client = await context.msGraphClientFactory.getClient();
    const res = await _client.api(`/users/${users?.Email}`).get();

    setInput((prev: any) => ({
      ...prev,
      selectedUser: users,
      role: res?.jobTitle || "",
    }));
  } catch (err) {
    console.error("Error in _getUserDetails", err);
  }
};
export { _getUserDetails, addInnovaTeam };
export default FetchInnovaTeamData;
