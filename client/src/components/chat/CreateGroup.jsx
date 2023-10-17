import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import Axios from 'axios'

const CreateGroup = ({setOpenNewGroupForm}) => {
    const navigate = useNavigate()
    const [groupTitle, setGroupTitle] = useState('')
    const handleGroupTitle = (e) => {
        const text = e.target.value.trimStart();
        setGroupTitle(text);
    }
    const handleFormSubmit = (e) => {
        e.preventDefault()
        Axios.post('http://localhost:8000/api/conversation/create-group/', {group_title: groupTitle})
        .then((res) => {
            Axios.post(`http://localhost:8000/api/conversation/${res.data.group_id}/send-message/`, 
            {content:`${res.data.first_creator_name} ${res.data.last_creator_name} Created the group`, isFromSystem: true})
            .then(() => {
                navigate(`/chat/${res.data.group_id}`);
                setOpenNewGroupForm(false);
            })
        })
        .catch((err) => console.log(err))
    }
    return (
        <div className='blur'>
            <form className='newGroupForm' onSubmit={handleFormSubmit} >
                <div className='close_div'>
                    <h2>New Group</h2>
                    <span onClick={()=> setOpenNewGroupForm(false)} ><CloseIcon /></span>
                </div>
                <div className='input_text'>
                    <label htmlFor="group_title">Group title</label>
                    <input value={groupTitle} minLength={3} onChange={handleGroupTitle} type="text" id='group_title' placeholder='My squad...' required />
                </div>
                <button className='createGroupBtn'>Create New Group</button>
            </form>
        </div>
    );
}

export default CreateGroup;
