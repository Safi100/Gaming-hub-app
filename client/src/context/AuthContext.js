// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
export const  AuthContext = createContext([]);

export function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  useEffect(() => {
    fetchCurrentUser();
  }, []);
  const fetchCurrentUser = () => {
    if (!Cookies.get('c_user')) return;
    axios.get('http://localhost:8000/api/user/currentUser')
      .then((res) => {
        setCurrentUser(res.data);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }
  const logout = () => {
    axios.post('http://localhost:8000/api/auth/logout')
    .then(() => setCurrentUser(null))
    .catch((err) => console.log(err))
  }

  return (
    <AuthContext.Provider value={{ currentUser, fetchCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
