import React from 'react';
import './loading.css'
 
const PageLoading = () => {
    return (
        <div className="page_loading">
            <div className="loading_container">
                <div className="parallel"></div>
                <div className="parallel"></div>
                <div className="parallel"></div>
            </div>
        </div>
    );
}

export default PageLoading;
