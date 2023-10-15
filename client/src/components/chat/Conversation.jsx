import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Message from '../../components/chat/Message';
import Axios from 'axios';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';
import io from '../socket';
import { deepOrange } from '@mui/material/colors';
import Avatar from '@mui/material/Avatar';
import Groups2Icon from '@mui/icons-material/Groups2';

function stringToColor(string) {
    let hash = 0;
    let i;
    /* eslint-disable no-bitwise */
      for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = '#';
      for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
      }
      /* eslint-enable no-bitwise */
    
      return color;
    }
    
    function stringAvatar(name) {
      return {
        sx: {
          bgcolor: stringToColor(name),
        },
        children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
      };
    }

const Conversation = ({ conversationID }) => {
    // const chatContext = useContext(ChatContext);
    const authContext = useContext(AuthContext);
    const navigate = useNavigate()
    const [conversation, setConversation] = useState({});
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true);
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
                setMessages([...res.data.messages]);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                navigate('/chat')
            });
    }, [conversationID]);

    useEffect(() => {
        // Scroll to the bottom when the conversation or loading state changes
        scrollToBottom();
    }, [conversation, loading]);

    // Function to scroll to the bottom of the messages div
    const scrollToBottom = () => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    };
    const [newMessage, setNewMessage] = useState('')
    const HandleMessage = (e) => {
        const text = e.target.value.trimStart();
        setNewMessage(text);
    }
    const SendMessage = (e) => {
        e.preventDefault();
        Axios.post(`http://localhost:8000/api/conversation/${conversationID}/send-message`, {content: newMessage})
        .then((res) => {
            e.target.reset();
            setNewMessage('');
            io.emit('new_message', { convID: conversationID, newMessage});
            scrollToBottom();
        })
        .catch((err) => console.log(err))
    }
    return (
        <>
            {loading ? <p>loading</p> : (
                <>
                    <div className='chat_box_header'>
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
                    <div className="messages" style={{ maxHeight: '450px', overflowY: 'auto' }} ref={messagesRef}>
                        {messages?.map(message => (
                            <Message message={message} key={message._id} />
                        ))}
                    </div>
                    <form className="message_input" onSubmit={SendMessage}>
                        <div className='icon_upload_image'><ImageIcon style={{color: '#fff'}} /></div>
                        <textarea type="text" value={newMessage} onChange={HandleMessage} placeholder={`Type a message`}/>
                        <button className='send'><SendIcon style={{color: "#fff"}}/></button>
                    </form>
                </>
            )}
        </>
    );
}

export default Conversation;
