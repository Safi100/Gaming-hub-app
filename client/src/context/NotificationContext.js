import React, { createContext, useContext, useEffect, useState } from 'react';
import Axios from 'axios';
import { AuthContext } from './AuthContext';
import io from '../components/socket';

// Create the NotificationContext with an initial value of an empty array
export const NotificationContext = createContext([]);

export const NotificationContextProvider = ({ children }) => {

  // get current user
  const authContext = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(authContext.currentUser);
  }, [authContext]);

  // get notifications live from socket
  useEffect(() => {
    io.on('sendNotification', ({userID, notification}) => {
        if(currentUser._id == userID) {
          console.log(notification);
            setCurrentUser(prevCurrentUser => ({
                ...prevCurrentUser,
                notifications: [...prevCurrentUser.notifications, notification],
            }))
        }
    })
    return () => {
      io.off('sendNotification')
    };
  }, [currentUser]);

  // Function to fetch clear notifications
function clearNotifications() {
  if(currentUser){ 
    Axios.delete('http://localhost:8000/api/user/clear-notifications')
    .then((res) => {
      setCurrentUser((prevCurrentUser) => ({
        ...prevCurrentUser,
        notifications: [],
      }));
    })
    .catch((err) => {
      console.log(err);
    });
  }
}

// Return the context value
const contextValue = currentUser ? { notifications: currentUser.notifications, clearNotifications } : { notifications: [], clearNotifications };

return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Export the useNotification hook
export const useNotification = () => {
  const { notification } = useContext(NotificationContext);
  return notification;
}