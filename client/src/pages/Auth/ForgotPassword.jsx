import React, { useState } from 'react';
import './auth.css'
import Axios from 'axios'
import AuthLoading from '../../components/loading/AuthLoading';

const ForgotPassword = () => {
    const [loading, setloading] = useState(false)
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const handleEmailChange = (e) => {
        const text = e.target.value.trimStart()
        setEmail(text)
    }
    const handleForgotPasswordForm = (e) => {
        e.preventDefault()
        setSuccess('')
        setError('')
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if(!emailPattern.test(email)) {
            setError('Invalid email address')
            return;
        }
        setloading(true);
        Axios.post('http://localhost:8000/api/auth/forgot-password', {email})
        .then(() => {
            setloading(false)
            setSuccess(true)
        })
        .catch(err => {
            setloading(false)
            setError(err.response.data)
        })
    }
    return (
        <div className='auth_container forgot_pass_container'>
            <form className='form' onSubmit={handleForgotPasswordForm} >
                {loading && <AuthLoading />}
                <div className='grid '>
                    <h2>Password Reset</h2>
                    <div className='input input_full'>
                        <label htmlFor="email">Enter your email address</label>
                        <input name='email' onChange={handleEmailChange} value={email} id='email' type="email" required style={{textTransform:'lowercase'}} />
                    </div>
                </div>
                {success && <p className='success'>Reset password link send to your email.</p>}
                {error && <p className='error'>{error}</p>}
                <button>Send</button>
            </form>
        </div>
    );
}

export default ForgotPassword;
