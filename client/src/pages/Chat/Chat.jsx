import React, { useContext, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChatContext } from '../../context/ChatContext';
import Conversation from '../../components/chat/Conversation';
import Conversation_list from '../../components/chat/Conversation_list';
import SearchChatResult from '../../components/chat/SearchChatResult';
import io from '../../components/socket';
import chatImage from '../../assets/chat_icon.png';
import './chat.css';

const Chat = () => {
  const chatContext = useContext(ChatContext)
  const { id } = useParams(); // conversation id
  useEffect(() => {
    const handleNewMessage = (data) => {
      // Handle new messages here
      chatContext.fetchConversations()
    };

    // Set up the 'new_message' event listener
    io.on('new_message', handleNewMessage);

    return () => {
      // Clean up the event listener when the component unmounts
      io.off('new_message', handleNewMessage);
    };
  }, [id]);

  return (
    <div className='chat_bg'>
      <div className='chat_container'>
        <div className='side_list'>
          <SearchChatResult />
          <div className='conversations'>
            {chatContext.conversations.map(conversation => (
              <Link to={`/chat/${conversation._id}`}  key={`${conversation._id}`} >
                <Conversation_list conversation={conversation}/>
              </Link>
            ))}
          </div>
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
    </div>
  );
};

export default Chat;
