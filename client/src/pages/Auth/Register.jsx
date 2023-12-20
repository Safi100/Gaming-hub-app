import {React, useState} from 'react';
import Axios from 'axios';
import './auth.css'
import AuthLoading from '../../components/loading/AuthLoading';

const Register = () => {
    const [loading, setloading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: null
      })
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const text = value.trimStart();
        setFormData((prevData) => ({
          ...prevData,
          [name]: text
        }))
    }
    const handleRegisterForm = (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        const full_name_Pattern = /^[A-Za-z\s]+$/u

        if (!["male", "female", ''].includes(formData.gender)) {
            setError('Select a gender, please.')
            return;
        }
        if(!emailPattern.test(formData.email)) {
            setError('Invalid email address')
            return;
        }
        if(!full_name_Pattern.test(formData.first_name) || !full_name_Pattern.test(formData.last_name)){
            setError('Only characters are allowed in first/last name.')
            return;
        }
        if(formData.password !== formData.confirmPassword){
            setError('Password and confirm password must match.')
            return;
        }
        if(formData.password.trim().length < 6){
            setError('Password must be at least 6 characters.')
            return;
        }
        setloading(true);
        Axios.post('http://localhost:8000/api/auth/register', formData)
        .then((res) => {
            setloading(false)
            e.target.reset();
            setFormData({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '', gender: null});
            setMessage(res.data.message)
        })
        .catch(err => {
            setloading(false)
            setError(err.response.data)
        })
    }
    return (
        <div className='auth_container'>
            <form className='form' onSubmit={handleRegisterForm}>
            {loading && <AuthLoading />}
                <div className='grid'>
                    <div className='input'>
                    <label htmlFor="fname">First Name</label>
                    <input name='first_name' onChange={handleInputChange} value={formData.first_name} id='fname' type="text" required placeholder='Only characters...'/>
                    </div>
                    <div className='input'>
                    <label htmlFor="lname">Last Name</label>
                    <input name='last_name' onChange={handleInputChange} value={formData.last_name} id='lname' type="text" required placeholder='Only characters...'/>
                    </div>
                    <div className='input input_full'>
                    <label htmlFor="email">Email</label>
                    <input name='email' onChange={handleInputChange} value={formData.email} id='email' type="email" required style={{textTransform:'lowercase'}} />
                    </div>
                    <div className='input'>
                    <label htmlFor="pass">Password</label>
                    <input name='password' onChange={handleInputChange} autoComplete='off' value={formData.password} id='pass' type="password" placeholder='At least 6 characters' required/>
                    </div>
                    <div className='input'>
                    <label htmlFor="ConfirmPass">Re-enter password</label>
                    <input name='confirmPassword' onChange={handleInputChange} autoComplete='off' value={formData.confirmPassword} id='ConfirmPass' type="password" placeholder='Confirm your password' required/>
                    </div>
                    <div className='input input_full gender_input'>
                    <label>Gender</label>
                    <div className='gender_dev'>
                        <label className='Select_gender' htmlFor='genderMale'>
                            <span>Male</span>
                            <input onClick={(e)=> formData.gender=e.target.value} id='genderMale' name='gender' value={'male'} type="radio" />
                        </label>
                        <label className='Select_gender' htmlFor='genderFemale'>
                            <span>Female</span>
                            <input onClick={(e)=> formData.gender=e.target.value} id='genderFemale' name='gender' value={'female'} type="radio" />
                        </label>
                        <label className='Select_gender' htmlFor='GenderNull'>
                            <span>Prefer not to say</span>
                            <input onClick={(e)=> formData.gender= e.target.value} id='GenderNull' name='gender' value={''} type="radio" />
                        </label>
                    </div>
                    </div>
                </div>
                <div className='d-flex gap-2 my-2 mt-3'>
                <input type="checkbox" required/>
                <p>See <a href="/help">help page</a> before.</p>
                </div>
                {error && <p className='error'>{error}</p>}
                {message && <p className='success'>{message}</p>}
                <button>Create Account</button>
                <p className='redirect'>Already have an account?<a href="/login"> Login</a></p>
            </form>
        </div>
    );
}
export default Register;
