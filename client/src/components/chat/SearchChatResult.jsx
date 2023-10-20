import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search';
import Axios from 'axios'
import Avatar from '@mui/material/Avatar';
import ChatLoading from '../loading/ChatLoading';
import { stringAvatar } from '../avatar';

const SearchChatResult = () => {
    const [search, setSearch] = useState('')
    const [users, setUsers] = useState([])
    const [conversationID, setConversationID] = useState(null)
    const [loading, setLoading] = useState(true)
    const Navigate = useNavigate()
    const handleSearch = (e) => {
        const text = e.target.value.trimStart()
        setSearch(text);
    }
    useEffect(() => {
        if(search.length < 1) return 
        setLoading(true)
        Axios.post(`http://localhost:8000/api/conversation/search-users-to-chat?q=${search}`)
        .then((res) => {
            setUsers(res.data)
            setLoading(false)
        })
        .catch((err) => console.log(err))
    }, [search])

    const FetchOrCreateConversation = (receiverUserId) => {
        Axios.post(`http://localhost:8000/api/conversation/create-or-fetch-private-conversation`, {receiverUserId})
        .then(res => {
            setUsers([])
            setSearch([])
            Navigate(`/chat/${res.data}`)
        })
        .catch((err) => console.log(err))
    }
    return (
        <div className='search'>
            <SearchIcon color='inherit' />
            <input type='text' value={search} onChange={handleSearch} placeholder='Search...' />
            {search.length > 0 &&
                <div className={`search_results ${users.length > 0 ? '' : 'no_result' }`}>
                    {!loading ? 
                    (users.length > 0 ?
                        users.map((user) => (
                            <div className='search_result' onClick={() => FetchOrCreateConversation(user._id)} key={user._id} >
                              <div className='avatar'>{user.avatar ? "still not" : <Avatar {...stringAvatar(`${user.first_name} ${user.last_name}`)} />}</div>
                              <div className='info'>
                                <p className='fullName'>{user.first_name} {user.last_name} {user.isAdmin && <span className='admin'>Admin</span>}</p>
                                <p className='email'>{user.email}</p>
                              </div>
                            </div>
                            ))
                            :
                            <h2>No Search result</h2>
                        )
                        :
                        <ChatLoading />
                    } 

                </div>
            }
      </div>
    );
}

export default SearchChatResult;
