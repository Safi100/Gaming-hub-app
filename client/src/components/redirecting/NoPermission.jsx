import React from 'react';
import './redirecting.css'

const NoPermission = () => {
    return (
        <div className='text-white text-center noPermission'>
            <div>
                <h2 className='text-center'>You don't have permission to be here</h2>
                <p>Go to <a href="/login">login </a> page and login as an owner, or return to <a href="/">home </a>page</p>
            </div>
        </div>
    );
}

export default NoPermission;
