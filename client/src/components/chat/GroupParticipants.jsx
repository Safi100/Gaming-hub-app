import React, {useEffect, useState, useContext} from 'react';
import { useParams } from 'react-router-dom' 
import CloseIcon from '@mui/icons-material/Close';
import Avatar from '@mui/material/Avatar';
import { stringAvatar } from '../avatar';
import { AuthContext } from '../../context/AuthContext';
import Axios from 'axios';

const GroupParticipants = ({admins, setOpenParticipantsMenu}) => {
    const {id} = useParams()
    const authContext = useContext(AuthContext);
    const userID = authContext.currentUser._id;
    const [group_participants, setGroupParticipants] = useState([])
    const [error, setError] = useState('')
    useEffect(() => {
        Axios.get(`http://localhost:8000/api/conversation/${id}/group-participants`)
        .then((res) => setGroupParticipants(res.data))
        .catch(err => console.log(err))
    }, [id])
    const handleRemoveUser = (userID) => {
        console.log("DELETED USER ", userID);
        Axios.delete(`http://localhost:8000/api/conversation/${id}/remove-user-from-group/${userID}`)
        .then((res) => {
            setGroupParticipants((prevParticipants) => prevParticipants.filter((participant) => participant._id !== userID))
            Axios.post(`http://localhost:8000/api/conversation/${id}/send-message`, {
                content: res.data.message,
                isFromSystem: true,
            })
            .then(() => {})
            .catch(err => console.log(err))
            
        }).catch((err) => {
            console.log(err);
            setError(err.response.data);
        })
    }
    return (
        <div className='blur'>
            <div className="GroupParticipants">
            <div className='close_div'>
                    <h2>Group participants</h2>
                    <span onClick={() => setOpenParticipantsMenu(false)}><CloseIcon /></span>
                </div>
                <div className="participants">
                    {group_participants?.map(participant => (
                    <div className='user_result participant_result' key={participant._id}>
                        <div>
                            <div className='avatar'>{participant.avatar ? "still not" : <Avatar {...stringAvatar(`${participant.first_name} ${participant.last_name}`)} />}</div>
                            <div className='user_info'>
                                <p className='fullName'>{participant.first_name} {participant.last_name} 
                                {userID === participant._id && <span className='sign'>me</span>}
                                {admins.includes(participant._id) && <span className='sign'>group admin</span>}

                                </p>
                                <p className='user_email'>{participant.email}</p>
                            </div>
                        </div>
                        {admins.includes(userID) && userID !== participant._id && (
                        <button onClick={() => handleRemoveUser(participant._id)} className='kick'>kick</button>
                        )}
                  </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default GroupParticipants;
