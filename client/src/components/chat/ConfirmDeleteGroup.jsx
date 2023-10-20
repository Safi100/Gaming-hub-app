import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import {ChatContext} from '../../context/ChatContext'

const ConfirmDeleteGroup = ({group, setOpenDeleteGroup}) => {
    const chatContext = useContext(ChatContext);
    const navigate = useNavigate()
    const [groupTitle, setGroupTitle] = useState('')
    const handleTitleChange = (e) => {
        const text = e.target.value.trimStart();
        setGroupTitle(text);
    }
    const handleDeleteGroup = (id) => {
        console.log(id);
        Axios.delete(`http://localhost:8000/api/conversation/${id}/delete-group`)
        .then((res) => {
            setOpenDeleteGroup(false);
            navigate('/chat');
            chatContext.fetchConversations();
        })
        .catch((err) => console.log(err))
    }
    return (
        <div className='blur'>
            <div className="confirmDeleteGroup">
                <h2>Confirm to delete group: {group.title}</h2>
                <div className="group_name_input">
                    <span>Type ({group.title}) to confirm</span>
                    <input value={groupTitle} onChange={handleTitleChange} type="text" />
                </div>
                <div className='buttons'>
                    <button className='DeleteBtn' disabled={groupTitle !== group.title} 
                    onClick={()=> handleDeleteGroup(group._id)}>Delete Group</button>
                    <button className='cancelBtn' onClick={()=> setOpenDeleteGroup(false)}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDeleteGroup;
