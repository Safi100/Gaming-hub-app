import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Axios from 'axios';

// Create the ChatContext with an initial value of an empty array
export const ChatContext = createContext([]);
export const ChatContextProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [fetchIntervalId, setFetchIntervalId] = useState(null);
  const [isOnChatPage, setIsOnChatPage] = useState(false);

  useEffect(() => {
    // Check the current route to determine if the user is on the chat page
    setIsOnChatPage(location.pathname.includes('chat'));
  }, [location]);

  useEffect(() => {
    // Fetch Conversations initially
    if (!isOnChatPage) return
    
    fetchConversations();
    // Set up a periodic fetch every minute
    const intervalId = setInterval(fetchConversations, 60000); // 60000 milliseconds = 1 minute
    setFetchIntervalId(intervalId);
    return () => {
      // Clean up the interval when the component closed
      clearInterval(fetchIntervalId); 
      setIsOnChatPage(false);
    };
  }, [isOnChatPage]);
  
  // Function to fetch Conversations
  function fetchConversations() {
    Axios.get('http://localhost:8000/api/conversation/conversation-list')
    .then(res => {
        setConversations(res.data);
    })
    .catch(err => {
      if(err.response.status === 401) navigate('/')
    });
  };


  // Return the context value
  const contextValue = { conversations, fetchConversations };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

// Export the useChat hook
export const useChat = () => {
  const { Chat } = useContext(ChatContext);
  return Chat;
}
