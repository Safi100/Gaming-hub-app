import {React, useContext, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css'
import Axios from 'axios'
import AuthLoading from '../../components/loading/AuthLoading';
import { AuthContext } from '../../context/AuthContext';
const Login = () => {
    const authContext = useContext(AuthContext)
    const navigate = useNavigate()
    const [loading, setloading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        email: '',
        password: '',
      })
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const text = value.trimStart();
        setFormData((prevData) => ({
          ...prevData,
          [name]: text
        }))
    }
    const handleLoginForm = (e) => {
        e.preventDefault()
        setError('')
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if(!emailPattern.test(formData.email)) {
            setError('Invalid email address')
            return;
        }
        if(formData.password.trim().length < 6){
            setError('Password too short, at least length 6.')
            return;
        }
        setloading(true);
        Axios.post('http://localhost:8000/api/auth/login', formData)
        .then((res) => {
            setloading(false)
            authContext.fetchCurrentUser()
            navigate('/')
        })
        .catch(err => {
            setloading(false)
            console.log(err);
            setError(err.response?.data)
        })
    }
    return (
        <div className='auth_container login_auth_container'>
            <form className='form' onSubmit={handleLoginForm}>
                {loading && <AuthLoading />}
                <div className='grid '>
                    <div className='welcome'>
                        <h2>Welcome back!</h2>
                        <p>Login and Connect with Gamers Worldwide!</p>
                    </div>
                    <div className='input input_full'>
                    <label htmlFor="email">Email</label>
                    <input name='email' onChange={handleInputChange} value={formData.email} id='email' type="email" required style={{textTransform:'lowercase'}} />
                    </div>
                    <div className='input input_full'>
                    <label htmlFor="pass">Password</label>
                    <input name='password' onChange={handleInputChange} autoComplete='off' value={formData.password} id='pass' type="password" placeholder='At least 6 characters' required/>
                    </div>
                </div>
                <div>
                    {error && <p className='error'>{error}</p>}
                    <button>Login</button>
                    <a href="/forgot-password">Forgot password</a>
                    <p className='redirect'>Don't have an account?<a href="/register"> Register</a></p>
                </div>
            </form>
        </div>
    );
}

export default Login;
