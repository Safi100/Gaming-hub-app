import {React, useContext, useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import { AES } from 'crypto-js';
import CryptoJS from 'crypto-js';
import Groups2Icon from '@mui/icons-material/Groups2';
import { deepOrange } from '@mui/material/colors';
import { AuthContext } from '../../context/AuthContext';
import { stringAvatar } from '../avatar';

const Conversation_list = ({conversation}) => {
  const {id} = useParams()
  const authContext = useContext(AuthContext);
  const userID = authContext.currentUser._id;
  
  // get time of last message
  // Function to format the timestamps
  const formatTimestamp = (timestamp) => {
    const currentDate = new Date();
    const messageDate = new Date(timestamp);
    const timeDifference = currentDate - messageDate;
    if (timeDifference < 60000) { // Less than a minute
      return '1m';
    } else if (timeDifference < 3600000) { // Less than an hour
      return `${Math.floor(timeDifference / 60000)}m`;
    } else if (timeDifference < 86400000) { // Less than a day
      return `${Math.floor(timeDifference / 3600000)}h`;
    } else if (timeDifference < 604800000) { // Less than a week
      return `${Math.floor(timeDifference / 86400000)}d`;
    } else if (timeDifference < 2419200000) { // Less than a month (approx. 28 days)
      return `${Math.floor(timeDifference / 604800000)}w`;
    } else if (timeDifference < 29030400000) { // Less than a year (approx. 11 months)
      return `${Math.floor(timeDifference / 2419200000)} months`;
    } else {
      return `${Math.floor(timeDifference / 29030400000)} y`;
    }
  };


    
    return (
      <div className={`conversation ${conversation._id === id ? 'selected' : ''}`}>
        <div>
          {conversation.type === 'private' ?
          <Avatar {...stringAvatar(`${conversation.participants[0]?.first_name} ${conversation.participants[0]?.last_name}`)} />
          :
          <Avatar sx={{ bgcolor: deepOrange[500] }}><Groups2Icon /></Avatar>        
          }
        </div>
        <div className='conversation_info'>
          <div className='name_time'>
            {conversation.type === 'private' ? <span>{conversation.participants[0]?.first_name} {conversation.participants[0]?.last_name} </span> : <span>{conversation.title}</span>}
            <span>{formatTimestamp(conversation.messages[0]?.timestamp)}</span>
          </div>
          <div>
            <div className='last_message_title'>
              {/* Decrypt the content before display it */}
              {!conversation.messages[0].isFromSystem && <span className='last_message'>{conversation.messages[0]?.sender._id === userID ? `me: ${AES.decrypt(conversation.messages[0].content, "thisiscryptosecretkey").toString(CryptoJS.enc.Utf8).replace(/@@LINE_BREAK@@/g, '')}` : `${conversation.type === 'group' ? `${conversation.messages[0].sender.first_name} ${conversation.messages[0].sender.last_name}: ` : ""}${AES.decrypt(conversation.messages[0].content, "thisiscryptosecretkey").toString(CryptoJS.enc.Utf8).replace(/@@LINE_BREAK@@/g, '')}`}</span>}
              {conversation.messages[0].isFromSystem && <span className='last_message'>{`${AES.decrypt(conversation.messages[0].content, "thisiscryptosecretkey").toString(CryptoJS.enc.Utf8).replace(/@@LINE_BREAK@@/g, '')}`}</span>}
              {conversation.unreadCount[userID] > 0 &&
                (conversation._id === id ? '' : <span className='unread'>{conversation.unreadCount[userID]}</span>)}
            </div>
          </div>
        </div>
      </div>
    );
}
    
export default Conversation_list;
