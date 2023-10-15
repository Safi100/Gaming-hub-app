import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { AES } from 'crypto-js';
import CryptoJS from 'crypto-js';

const Message = ({message}) => {
    const authContext = useContext(AuthContext)
    const [userID, setUserID] = useState('')
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        setUserID(authContext.UserID());
        setLoading(false);
    }, [authContext]);

    // Decrypt the content before rendering the component
    const decryptedBytes = AES.decrypt(message.content, 'thisiscryptosecretkey');
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    // Replace \n with <br> to display line breaks
    const formattedText = decryptedText.replace(/@@LINE_BREAK@@/g, '<br>');
    return (
        <div className={`${ !loading && message.sender._id === userID ? 's' : 'r'}`} >
            <div className={`message`}>
                <p dangerouslySetInnerHTML={{ __html: formattedText }} />
            </div>
        </div>
    );
}

export default Message;
