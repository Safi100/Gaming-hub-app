import {React, useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom'
import Axios from 'axios';
import './auth.css'
import AuthLoading from '../../components/loading/AuthLoading';

const ResetPassword = () => {
    const {id, token} = useParams()
    const navigate = useNavigate() 
    const [loading, setloading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
      })
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        const text = value.trimStart();
        setFormData((prevData) => ({
          ...prevData,
          [name]: text
        }))
    }
    const handleResetPasswordForm = (e) => {
        e.preventDefault()
        setSuccess('')
        setError('')
        if(formData.password.trim().length < 6){
            setError('Password must be at least 6 characters.')
            return;
        }
        if(formData.password !== formData.confirmPassword){
            setError('Password and confirm password must match.')
            return;
        }
        setloading(true);
        Axios.post(`http://localhost:8000/api/auth/reset-password/${id}/${token}`, formData)
        .then(res => {
            setloading(false)
            if(res.status == 200){
                setSuccess(true)
            }
        })
        .catch(err => {
           setloading(false)
           setError(err.response.data)
        }
    );
    }
    return (
        <div className='auth_container reset_pass_container'>
            <form className='form' onSubmit={handleResetPasswordForm}>
            {loading && <AuthLoading />}
                <div className='grid'>
                    <h2>Reset your password</h2>
                    <div className='input input_full'>
                        <label htmlFor="pass">New password</label>
                        <input name='password' onChange={handleInputChange} autoComplete="off" value={formData.password} id='pass' type="password" placeholder='At least 6 characters' required/>
                    </div>
                    <div className='input input_full'>
                        <label htmlFor="ConfirmPass">Re-enter new password</label>
                        <input name='confirmPassword' onChange={handleInputChange} autoComplete="off" value={formData.confirmPassword} id='ConfirmPass' type="password" placeholder='Confirm your password' required/>
                    </div>
                </div>
                <div>
                    {error && <p className='error'>{error}</p>}
                    {success && <p className='success'>Your password has been changed.</p>}
                    <button>Reset Password</button>
                    <a href="/login">{`Login ->`}</a>
                </div>
            </form>
        </div>
    );
}

export default ResetPassword;
