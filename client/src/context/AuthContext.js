// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const  AuthContext = createContext([]);

export function AuthContextProvider({ children }) {

  const [id, setID] = useState('')

    // Function to check if the authentication token cookie exists
    const UserID = () => {
      return id;
    };

  useEffect(() => {
    const user = Cookies.get('c_user');
    if (user) setID(user);
  }, []);

  return (
    <AuthContext.Provider value={{ UserID }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
