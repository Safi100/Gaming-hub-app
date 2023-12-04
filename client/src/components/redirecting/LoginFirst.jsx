import React from 'react';
import './redirecting.css'

const LoginFirst = () => {
    return (
        <div className='text-white text-center NotLoggedIn'>
            <div>
                <h2 className='text-center'>You are not Logged in</h2>
                <p>Go to <a href="/login">login </a> page and login, or return to <a href="/">home </a>page</p>
            </div>
        </div>
    );
}

export default LoginFirst;
