import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Axios from 'axios';
import AuthLoading from '../../components/loading/AuthLoading';
import './auth.css'

const EmailVerify = () => {
    const {id, token} = useParams()
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        Axios.post(`http://localhost:8000/api/auth/verify-email/${id}/${token}`)
        .then(res => {
            setMessage(res.data.message)
            setLoading(false)
        })
        .catch(err => {
            setLoading(false)
            setError(err.response.data)
            console.log(err);
        })
    }, [])
    return (
        <div className='auth_container'>
            <div className='verify_dev' >
                {loading && <AuthLoading />}
                {message && <>
                    <p className='success'>{message}</p>
                    <p>Go back to <a href="/login">login page</a> and sign in</p>
                </>}
                {error && <p className='error'>{error}</p>}
            </div>
        </div>
    );
}

export default EmailVerify;
