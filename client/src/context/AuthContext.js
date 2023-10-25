// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
export const  AuthContext = createContext([]);

export function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  useEffect(() => {
    if(!Cookies.get('c_user')) return;
    axios.get('http://localhost:8000/api/user/currentUser')
    .then((res) => {
      setCurrentUser(res.data)
    })
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
