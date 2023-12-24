import React, { useContext } from 'react';
import {useNavigate} from 'react-router-dom'
import './redirecting.css'
import { AuthContext } from '../../context/AuthContext';

const BannedUsers = ({banDetails}) => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    const handleLogout = () => {
        authContext.logout(); // Call the logout method from authContext
        navigate('/login');
      };
    return (
        <div className='text-white  banned'>
            <div>
                <h2 className='mb-4'>Your account is banned *_*</h2>
                <p>Ban from <span className='banDate'>{new Date(banDetails.bannedFrom).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' , hour: 'numeric', minute: 'numeric', second: 'numeric'})}</span></p>
                <p>to <span className='banDate'>{banDetails?.bannedUntil ==  null  ? 'Forever' : new Date(banDetails?.bannedUntil).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' , hour: 'numeric', minute: 'numeric', second: 'numeric'})}</span></p>
                <div className='my-4'>
                    <p>Ban for:</p>
                    <p>{banDetails.reason}</p>
                </div>
                <p className='mb-3'>Contact <a>gamingplatform2002@gmail.com</a> for more information.</p>
                <button className='btn btn-danger' onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}

export default BannedUsers;
