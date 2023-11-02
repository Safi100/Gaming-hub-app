import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { AES } from 'crypto-js';
import CryptoJS from 'crypto-js';
import Avatar from '@mui/material/Avatar';
import { stringAvatar } from '../avatar';

const Message = ({message, isGroup}) => {
    const authContext = useContext(AuthContext)
    const [userID, setUserID] = useState('')
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        if (authContext.currentUser) {
            setUserID(authContext.currentUser._id);
          }
        setLoading(false);
    }, [authContext]);

    // Decrypt the content before rendering the component
    const decryptedBytes = AES.decrypt(message.content, 'thisiscryptosecretkey');
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    // Replace \n with <br> to display line breaks
    const formattedText = decryptedText.replace(/@@LINE_BREAK@@/g, '<br>');
    return (
        <>
        {!loading &&
            <div className={`${ !loading && message.isFromSystem ? "system": (message.sender._id === userID ? 's' : 'r') }`} >
                {isGroup && !message.isFromSystem && message.sender._id !== userID && <div className='avatar'>{message.sender.avatar ? <img src={message.sender.avatar.url} alt="user avatar image" /> : <Avatar {...stringAvatar(`${message.sender.first_name} ${message.sender.last_name}`)} />}</div>}
                <div className='message'>
                    {isGroup && !message.isFromSystem && <>{message.sender._id !== userID && <span className='sender_name'>{message.sender.first_name} {message.sender.last_name} </span>}</>}
                    <p dangerouslySetInnerHTML={{ __html: formattedText }} />
                    {!message.isFromSystem && <p className='message_date'>{new Date(message.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: 'numeric'})}</p>}
                </div>
            </div>
        }
        </>
    );
}

export default Message;
