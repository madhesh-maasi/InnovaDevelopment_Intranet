import { IUserDetails } from "../../Interface/CommonInterface";

const peopleHandler = (Users: any[]): IUserDetails => {
  const user= Users?.map((user, index) => ({
    Id: parseInt(user.ID || user.Id || user.id),
    Email: user.EMail || user.Email || user.email,
    DisplayName: user.Title || user.DisplayName || user.name,
    Key: index,
    ImgUrl:
      `/_layouts/15/userphoto.aspx?size=S&accountname=` +
      `${user.EMail || user.Email || user.email}`,
  }));
  return user[0]
}
export {peopleHandler}