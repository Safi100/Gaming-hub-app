import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Axios from 'axios';
import { AuthContext } from './AuthContext';
import io from '../components/socket';
// Create the ChatContext with an initial value of an empty array
export const ChatContext = createContext([]);

export const ChatContextProvider = ({ children }) => {

  // get current user
  const [currentUser, setCurrentUser] = useState(null);
  const authContext = useContext(AuthContext);
  useEffect(() => {
    setCurrentUser(authContext.currentUser);
  }, [authContext]);
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fetchIntervalId, setFetchIntervalId] = useState(null);
  const [isOnChatPage, setIsOnChatPage] = useState(false);

  useEffect(() => {
    // Check the current route to determine if the user is on the chat page
    setIsOnChatPage(location.pathname.includes('chat'));
  }, [location]);

  useEffect(() => {
    // Fetch Conversations initially and set up the periodic fetch
    fetchConversations();
    io.on('new_message', () => {
      fetchConversations()
    })
    if (!isOnChatPage) return
    
    // Set up a periodic fetch every minute
    const intervalId = setInterval(fetchConversations, 60000); // 60000 milliseconds = 1 minute
    setFetchIntervalId(intervalId);
    return () => {
      // Clean up the interval when the component closed
      clearInterval(fetchIntervalId); 
      setIsOnChatPage(false);
      io.off('new_message')
    };
  }, [isOnChatPage, currentUser]);
  
// Function to fetch Conversations
function fetchConversations() {
  if(currentUser){ 
    Axios.get('http://localhost:8000/api/conversation/conversation-list')
    .then((res) => {
      setConversations(res.data);
      let counter = 0;
      res.data.forEach((conversation) => {
        counter += conversation.unreadCount[currentUser?._id];
      });
      setUnreadCount(counter);
    })
    .catch((err) => {
      console.log(err);
    });
  }
}
// Return the context value
const contextValue = { conversations, fetchConversations, unreadCount };

return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

// Export the useChat hook
export const useChat = () => {
  const { chat } = useContext(ChatContext);
  return chat;
}
