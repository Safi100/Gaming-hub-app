import React from 'react';
import './redirecting.css'

const NotAuthorize = () => {
    return (
        <div className='text-white text-center NotAuthorize'>
            <div>
                <h2>This page is only for admins</h2>
                <p>Go to <a href="/login">login </a> page and login as an admin, or return to <a href="/">home </a>page</p>
            </div>
        </div>
    );
}

export default NotAuthorize;
