import { graph } from "@pnp/graph/presets/all";
import { IUserDetails } from "../../Interface/CommonInterface";
import { GraphId } from "../../Config/config";

const peopleHandler = (Users: any[]): IUserDetails => {
  const user = Users?.map((user, index) => ({
    Id: parseInt(user.ID || user.Id || user.id),
    Email: user.EMail || user.Email || user.email,
    DisplayName: user.Title || user.DisplayName || user.name,
    Key: index,
    ImgUrl:
      `/_layouts/15/userphoto.aspx?size=S&accountname=` +
      `${user.EMail || user.Email || user.email}`,
  }));
  return user[0];
};
const getPermissionLevel = async (currentuser: any): Promise<boolean> => {
  try {
    // console.log("graph", graph);

    const response = await graph.groups
      .getById(GraphId.AdminGroupMembers)
      .members.get();
    // console.log("response", response);

    const isAdmin = response.some(
      (res: any) =>
        res.mail.toLowerCase() === currentuser[0]?.Email.toLowerCase()
    );

    return isAdmin;
  } catch (error) {
    console.error("Error checking permissions:", error);
    return false;
  }
};

export { peopleHandler, getPermissionLevel };
