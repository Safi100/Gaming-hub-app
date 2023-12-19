import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthContextProvider } from './context/AuthContext';
import { NotificationContextProvider } from './context/NotificationContext';
import { ChatContextProvider } from './context/ChatContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
  <AuthContextProvider>
    <NotificationContextProvider>
      <ChatContextProvider>
        <App />
      </ChatContextProvider>
    </NotificationContextProvider>
  </AuthContextProvider>
  </BrowserRouter>
);
