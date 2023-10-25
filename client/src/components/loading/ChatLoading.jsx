import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import './loading.css'

const ChatLoading = () => {
    return (
        <div className='chat_loading'>
            <CircularProgress color="success" />
        </div>
    );
}

export default ChatLoading;
