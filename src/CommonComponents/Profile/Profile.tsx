import { Avatar } from 'primereact/avatar'
import { AvatarGroup } from 'primereact/avatargroup'
import *as React from 'react'
import './Profile.css'
const Profile = (props:any) => {
    return (
        <div>
             <AvatarGroup>
             <div className='profile'>
                <Avatar
                    image={props?.TeamMember?.ImgUrl}
                    size="large"
                    shape="circle"
                  />
                  <div>{props?.TeamMember?.DisplayName}</div>
            </div>
          </AvatarGroup>
        </div>
    )
}

export default Profile
