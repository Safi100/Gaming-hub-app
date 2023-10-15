import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from '../components/socket'; // Import io.io-client
import Axios from 'axios';
// Create the ChatContext with an initial value of an empty array
export const ChatContext = createContext([]);
export const ChatContextProvider = ({ children }) => {
  const navigate = useNavigate()
  const {id} = useParams()
  const [conversations, setConversations] = useState([]);
  const [fetchIntervalId, setFetchIntervalId] = useState(null);
  const [isOnChatPage, setIsOnChatPage] = useState(false);
  useEffect(() => {
    // Check if you are on the chat page
    setIsOnChatPage(true);
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
      console.error(err);    
      // Handle the error here and possibly set an error state
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
