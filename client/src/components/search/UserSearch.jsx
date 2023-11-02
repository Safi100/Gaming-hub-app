import React from 'react';
import {Link} from 'react-router-dom'
import Avatar from '@mui/material/Avatar';
import { stringAvatar } from '../avatar';

const UserSearch = ({user}) => {
    return (
        <Link className='userResult' to={`/profile/${user._id}`} >
            <div className="image">
                {user.avatar.url ?
                <img src={user.avatar.url} alt={"user avatar"} />
                :
                <Avatar {...stringAvatar(`${user.title}`)} />}
            </div>
            <div>
                <p className='title' >{user.title} {user.isAdmin && <span className='admin'>Admin</span> }</p>
                <p>{user.email}</p>
            </div>
        </Link>
    );
}

export default UserSearch;
