/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Avatar } from "primereact/avatar";
import { AvatarGroup } from "primereact/avatargroup";
import * as React from "react";
import "./Profile.css";
const Profile = (props: any) => {
  return (
    <div>
      <AvatarGroup>
        <div className="profile">
          <Avatar
            image={props?.TeamMember?.ImgUrl}
            size="large"
            shape="circle"
          />
          <div className="userName">{props?.TeamMember?.DisplayName}</div>
        </div>
      </AvatarGroup>
    </div>
  );
};

export default Profile;
