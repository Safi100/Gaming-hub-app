import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import './loading.css'
const AuthLoading = () => {
    return (
        <div className='auth_loading'>
            <CircularProgress color="success" />
        </div>
    );
}

export default AuthLoading;
