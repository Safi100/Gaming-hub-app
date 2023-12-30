import React from 'react';
import NotFoundImg from '../../assets/404.png'
const NotFound = () => {
    return (
        <div className='wrapper text-center py-4'>
            <img src={NotFoundImg} alt="no found" />
            <p>There's nothing here</p>
            <p>return to <a className='text-warning' href="/">Home page</a></p>
        </div>
    );
}

export default NotFound;
