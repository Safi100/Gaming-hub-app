import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import io from '../socket';
import Message from '../../components/chat/Message';
import AddToGroup from './AddToGroup';
import GroupParticipants from './GroupParticipants'
import { stringAvatar } from '../avatar';
import SendIcon from '@mui/icons-material/Send';
import { deepOrange } from '@mui/material/colors';
import Avatar from '@mui/material/Avatar';
import Groups2Icon from '@mui/icons-material/Groups2';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Axios from 'axios';

const Conversation = ({ conversationID }) => {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate()
    const [conversation, setConversation] = useState({});
    const [groupParticipants, setGroupParticipants] = useState([]);
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true);
    const [openAddToGroupForm, setOpenAddToGroupForm] = useState(false);
    const [openParticipantsMenu, setOpenParticipantsMenu] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);
    const messagesRef = useRef(null);
    const [userID, setUserID] = useState('')
    useEffect(() => {
        setUserID(authContext.UserID());
    }, [authContext])
    useEffect(() => {
        // Listen for new messages
        io.on('new_message', ({ convID, newMessage }) => {
          if (conversationID === convID) {
            // Update the conversation state with the new message
            setMessages((prevMessages) => ([...prevMessages, newMessage] ));
            // Delay the scroll to ensure all the new messages are rendered
            setTimeout(() => {
                scrollToBottom();
            }, 0);
          }
        });
        return () => {
          // Clean up the event listener when the component unmounts
          io.off('new_message');
        };
    }, [conversationID]);

    useEffect(() => {
        Axios.get(`http://localhost:8000/api/conversation/${conversationID}`)
            .then(res => {
                setConversation(res.data);
                if(res.data.type === 'group'){ setGroupParticipants([...res.data.participants]);}
                setMessages([...res.data.messages]);
                setLoading(false);
                setTimeout(() => {
                    scrollToBottom();
                }, 0);
            })
            .catch(err => {
                console.log(err);
                navigate('/chat')
            });
    }, [conversationID]);
    // Function to scroll to the bottom of the messages div
    const scrollToBottom = () => {
        if (messagesRef.current) {
            // console.log(messagesRef.current.scrollHeight);
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            // console.log('Scrolled to bottom');
        }
    };
    const [newMessage, setNewMessage] = useState('')
    const HandleMessage = (e) => {
        const text = e.target.value.trimStart();
        setNewMessage(text);
    }
    const SendMessage = (e) => {
        e.preventDefault();
        if(newMessage.length < 1) return; 
        Axios.post(`http://localhost:8000/api/conversation/${conversationID}/send-message`, {content: newMessage})
        .then((res) => {
            e.target.reset();
            setNewMessage('');
            io.emit('new_message', { convID: conversationID, newMessage});
        })
        .catch((err) => console.log(err))
    }
    return (
        <>
            {loading ? <p>loading</p> : (
                <>
                    <div className='chat_box_header'>
                        <div className='info'>
                            <div className="avatar">
                                {conversation.type === 'private' ?
                                <Avatar variant="square" style={{width:'60px', height:'60px'}} {...stringAvatar(`${conversation.participants.filter(participant => participant._id !== userID).map(participant => `${participant.first_name} ${participant.last_name}`)}`)} />
                                :
                                <Avatar variant="square" sx={{ bgcolor: deepOrange[500], width:60, height: 60}}><Groups2Icon /></Avatar>        
                                }
                            </div>
                            <div>
                                <p>{conversation.type === 'private' ? conversation.participants.filter(participant => participant._id !== userID).map(participant => (<span className='participant_name' key={participant._id}>{`${participant.first_name} ${participant.last_name}`} {participant.isAdmin ? <span className='admin'>Admin</span> : null} </span> )) 
                                : `${conversation.title}`}</p>
                                <p>{conversation.type === 'private' ? `Joined at ${conversation.participants.filter(participant => participant._id !== userID).map(participant => new Date(participant.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}))}`
                                : `Created at ${new Date(conversation.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}`}</p>
                            </div>
                        </div>
                        {conversation.type === 'group' && <>
                            <span className='menu_conversation' onClick={() => setOpenMenu(!openMenu)}>
                                <MoreVertIcon />
                                {openMenu && <div className="menu">
                                        {conversation.admins.includes(userID) && <span onClick={()=> setOpenAddToGroupForm(true)}>Add to group</span>}
                                        <span onClick={()=> setOpenParticipantsMenu(true)}>Participants</span>
                                        <span>Leave Group</span>
                                    </div>}
                            </span>
                        </>}
                    </div>

                    <div className="messages" style={{ maxHeight: '450px', overflowY: 'auto' }} ref={messagesRef}>
                        {messages?.map(message => (
                            <Message message={message} isGroup={conversation.type === "group"} key={message._id} />
                        ))}
                    </div>
                    <form className="message_input" onSubmit={SendMessage}>
                        <textarea type="text" value={newMessage} onChange={HandleMessage} placeholder={`Type a message`}/>
                        <button className='send'><SendIcon style={{color: "#fff"}}/></button>
                    </form>
                    {conversation.type === "group" && openAddToGroupForm && conversation.admins.includes(userID) && 
                    <AddToGroup 
                        setGroupParticipants={setGroupParticipants}
                        setOpenAddToGroupForm={setOpenAddToGroupForm} 
                    />}
                    {conversation.type === "group" && openParticipantsMenu && 
                    <GroupParticipants 
                        admins={conversation.admins} 
                        group_participants={groupParticipants} 
                        setGroupParticipants={setGroupParticipants} 
                        setOpenParticipantsMenu={setOpenParticipantsMenu} 
                    />}
                </>
            )}
        </>
    );
}

export default Conversation;
