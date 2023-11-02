import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import './loading.css'
const Loading = () => {
    return (
        <div className='loading'>
            <CircularProgress color="success" />
        </div>
    );
}

export default Loading;
