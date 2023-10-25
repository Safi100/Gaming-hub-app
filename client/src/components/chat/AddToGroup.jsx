import React, { useState, useEffect } from 'react';
import {useParams} from 'react-router-dom'
import CloseIcon from '@mui/icons-material/Close';
import ChatLoading from '../loading/ChatLoading';
import Avatar from '@mui/material/Avatar';
import Axios from 'axios'
import { stringAvatar } from '../avatar';

const AddToGroup = ({setOpenAddToGroupForm}) => {
    const {id} = useParams()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [users, setUsers] = useState([])
    const [selectedUsers, setSelectedUsers] = useState([])

    const handleSearch = (e) => {
        const text = e.target.value.trimStart();
        setSearch(text);
    }
    // search for users
    useEffect(() => {
        setUsers([])
        if(search.length < 1) return 
        setLoading(true)
        Axios.post(`http://localhost:8000/api/conversation/${id}/search-users-to-add?q=${search}`)
        .then((res) => {
            setUsers(res.data);
            setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        })
    }, [search])

    // selected users to add to the group
    const hadleSelectedUsers = (user) => {
      const userExists = selectedUsers.some((existingUser) => existingUser._id === user._id);
      if(userExists) return;
      setSelectedUsers((prevUsers)=> [...prevUsers, user])
    }
    const removeSelectedUsers = (userID) => {
      setSelectedUsers((prevUsers) => prevUsers.filter((user) => user._id !== userID))
    }
    // function to add users to the group
    const handleAddUsersForm = (e) => {
      e.preventDefault();
      if(selectedUsers.length < 1) return;
      const userIds = selectedUsers.map(user => user._id).join(',');
      Axios.post(`http://localhost:8000/api/conversation/${id}/add-user-to-group/${userIds}`)
      .then((res) => {
        setSelectedUsers([])
        console.log(res.data);
        Axios.post(`http://localhost:8000/api/conversation/${res.data.groupID}/send-message/`, {content:`${res.data.message}`, isFromSystem: true})
        .then(() => {
          setOpenAddToGroupForm(false)
        })
      })
      .catch(err => {
        console.log(err)
        setSelectedUsers([])
        setError(err.response.data)
      })
    }
    return (
        <div className='blur'>
            <form className="addToGroupForm" onSubmit={handleAddUsersForm} >
                <div className='close_div'>
                    <h2>Add users</h2>
                    <span onClick={() => setOpenAddToGroupForm(false)}><CloseIcon /></span>
                </div>
                <input value={search} onChange={handleSearch} type="text" placeholder='Search...'/>
                <div className='selected_users'>
                  {selectedUsers.map(user => (
                    <div className='user_result' key={user._id}>
                      <div className='avatar'>{user.avatar ? "still not" : <Avatar {...stringAvatar(`${user.first_name} ${user.last_name}`)} />}</div>
                      <div className='user_info'>
                        <span className='fullName'>{user.first_name} {user.last_name}</span>
                        <span onClick={()=> removeSelectedUsers(user._id)}><CloseIcon /></span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='searchResult'>
                    {loading ? <ChatLoading /> :
                        users.length > 0 ?
                        users.map((user) => (
                            <div className="user_result" onClick={()=> hadleSelectedUsers(user)} key={user._id}>
                                <div className='avatar'>{user.avatar ? "still not" : <Avatar {...stringAvatar(`${user.first_name} ${user.last_name}`)} />}</div>
                                <div className='user_info'>
                                  <p className='fullName'>{user.first_name} {user.last_name} {user.isAdmin && <span className='admin'>Admin</span>}</p>
                                  <p className='email'>{user.email}</p>
                                </div>
                            </div>
                        ))
                        :
                        null
                    }
                </div>
                {error && <p>{error}</p>}
                <button className='AddUsersBtn'>Add users to group</button>
            </form>
        </div>
    );
}

export default AddToGroup;
