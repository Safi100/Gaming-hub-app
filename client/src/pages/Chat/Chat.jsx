import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChatContext } from '../../context/ChatContext';
import Conversation from '../../components/chat/Conversation';
import Conversation_list from '../../components/chat/Conversation_list';
import SearchChatResult from '../../components/chat/SearchChatResult';
import io from '../../components/socket';
import chatImage from '../../assets/chat_icon.png';
import './chat.css';
import CreateGroup from '../../components/chat/CreateGroup';
import { AuthContext } from '../../context/AuthContext';
import LoginFirst from '../../components/redirecting/LoginFirst';

const Chat = () => {
  const navigate = useNavigate();
  // get current user
  const [currentUser, setCurrentUser] = useState(null);
  const authContext = useContext(AuthContext);

  const chatContext = useContext(ChatContext)
  const { id } = useParams(); // conversation id
  const [openNewGroupForm, setOpenNewGroupForm] = useState(false);
  const [conversations, setConversations] = useState([])
  useEffect(() => {
    setConversations(chatContext.conversations)
    const handleNewMessage = (data) => {
      // Handle new messages here
      // chatContext.fetchConversations()
      setConversations(chatContext.conversations);
    };

    // Set up the 'new_message' event listener
    io.on('new_message', handleNewMessage);

    return () => {
      // Clean up the event listener when the component unmounts
      io.off('new_message', handleNewMessage);
    };
  }, [id, chatContext]);

  return (
    (!authContext.currentUser) ? <LoginFirst /> :
    <div className='chat_bg'>
      <div className='chat_container'>
        <div className='side_list'>
          <a className='btn mb-3' href="/">Return to home page</a>
          <SearchChatResult />
          <div className='conversations'>
            {conversations?.map(conversation => (
              <Link to={`/chat/${conversation._id}`}  key={`${conversation._id}`} >
                <Conversation_list conversation={conversation}/>
              </Link>
            ))}
          </div>
          <button className='createGroupBtn' onClick={()=> setOpenNewGroupForm(true)}>Create Group</button>
        </div>
        <div className='chat_box'>
          {id ? (
            <Conversation conversationID={id} />
          ) : (
            <div className='no-chat'>
              <img src={chatImage} alt='chat_icon' />
              <h2>Select chat to start</h2>
            </div>
          )}
        </div>
      </div>
      {openNewGroupForm && <CreateGroup setOpenNewGroupForm={setOpenNewGroupForm} />}
    </div>
  );
};

export default Chat;
