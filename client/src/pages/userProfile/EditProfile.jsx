import {useState} from 'react';
import { Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { stringAvatar } from '../../components/avatar';
import Avatar from '@mui/material/Avatar';
import Axios from 'axios'
import CloseIcon from '@mui/icons-material/Close';

function EditProfile({user, setUser, setOpenEdit}) {
  // toast notification
  const notify = () => {
    toast("Profile Updated successfully!", {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
    });
  }
  // toast notification password
  const notifyPass = () => {
    toast("Password changed successfully!", {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });
}
  // account details form
  const [validated, setValidated] = useState(false)
  const [error, setError] = useState('')
  const [gender, setGender] = useState(user.gender == null ? "" : user.gender)
  const [avatar, setAvatar] = useState('')
  const [updateLoading, setUpdateLoading] = useState(false)
  const [formData, setFormData] = useState({
    f_name: user.first_name,
    l_name: user.last_name,
    bio: user.bio,
    password: '',
    confirm_password: ''
  })
  // password form
  const [validatedPasswordForm, setValidatedPasswordForm] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [updatePasswordLoading, setUpdatePasswordLoading] = useState(false)
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const deleteProfilePicture = () => {
    Axios.delete(`http://localhost:8000/api/user/remove-profile-picture`)
    .then((res) => {
        // response contains the null avatar
        setUser((prevUser) => ({
          ...prevUser,
          avatar: res.data,
        }));
        console.log(res.data);
      })
      .catch((err) => {
        // Handle any errors that occur during the API request.
        console.error(err);
      });
}
  // input change event
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
        ...formData,
        [name]: value.trimStart()
    });
  };
  // passwords change event
  const handlePasswordsChange = (event) => {
    const { name, value } = event.target;
    setPasswords({
        ...passwords,
        [name]: value.trimStart()
    });
  };
  const handleImageChange = (e) => {
    setAvatar(e.target.files[0])
  }
  // submit form
  const handleSubmit = (event) => {
    setValidated(true);
    setError('')
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }else{
      const full_name_Pattern = /^[A-Za-z\s]+$/u
      if(!full_name_Pattern.test(formData.f_name) || !full_name_Pattern.test(formData.l_name)){
        setError('Only characters are allowed in first/last name.')
        return;
    }
      // if successful submit form
      setUpdateLoading(true);
      const Data = new FormData()
      Data.append('first_name', formData.f_name)
      Data.append('last_name', formData.l_name)
      Data.append('avatar', avatar)
      Data.append('gender', gender)
      Data.append('bio', formData.bio)
      Axios.put('http://localhost:8000/api/user/edit-profile', Data)
      .then(res => {
        // Handle the response
        setUpdateLoading(false)
        event.target.reset()
        setAvatar('')
        notify()
        setUser(res.data)
      })
      .catch(error => {
        // Handle errors
        console.log(error)
      });
    }
  }
  const handleSubmitChangePassword = (event) => {
    setValidatedPasswordForm(true);
    setError('')
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }else{
      setPasswordError('');
      if(passwords.new_password.trim() !== passwords.confirm_password.trim()) {
        setPasswordError("Passwords don't match.")
        return;
    }
      setUpdatePasswordLoading(true);
      Axios.put('http://localhost:8000/api/user/change-password', passwords)
      .then((res) => {
        setUpdatePasswordLoading(false);
        notifyPass()
        setValidatedPasswordForm(false);
        setPasswords({
          current_password: '',
          new_password: '',
          confirm_password: ''
        })
      })
      .catch((err) => {
        setPasswordError(err.response.data)
        setUpdatePasswordLoading(false);
        setValidatedPasswordForm(false);
        console.log(err)
      })
    }
  }

  return (
    <div className='blur'>
      <ToastContainer/>
      <Row className='edit_profile'>
        <div className='mb-2 d-flex justify-content-between align-items-center'>
          <span className='fs-2'>Profile Settings</span>
          <span className='cursor-pointer' onClick={() => setOpenEdit(false)}><CloseIcon /></span>
        </div>
        <Col xl={4}>
          {/* Profile picture card */}
          <Card className="mb-4 mb-xl-0 card_box position-sticky top-0">
            <Card.Header className='text-white border-bottom border-secondary'>Profile Picture</Card.Header>
            <Card.Body className="text-center">
              {/* Profile picture image */}
              {user.avatar ? 
              <>
              <div className='img-account-profile mb-3'><img src={user.avatar.url} alt="user profile_picture" /></div>
              <Button className='btn-danger' onClick={deleteProfilePicture}>Remove profile picture</Button>
              </>
              :
              <div className='img-account-profile'> <Avatar style={{width:"100%", height: "100%"}} variant="square" {...stringAvatar(`${user.first_name} ${user.last_name}`)} /></div>
              }
              {/* Profile picture upload button */}
              <div className='d-flex gap-3 justify-content-center'>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
        <Card className="mb-4 card_box">
          <Card.Header className='text-white border-bottom border-secondary'>Account Details</Card.Header>
          <Card.Body>
          <Form className='editGameForm text-white' noValidate validated={validated} onSubmit={handleSubmit} >
          <Row>
            <Col xs={12} md={6} className='mb-2'>
              <Form.Group controlId="validationCustom01">
                <Form.Label>First Name</Form.Label>
                <Form.Control name="f_name" value={formData.f_name} onChange={handleInputChange} required type="text" placeholder='Only characters...' />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">Please provide a First Name.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={6} className='mb-2'>
              <Form.Group controlId="validationCustom02">
                <Form.Label>Last Name</Form.Label>
                <Form.Control name="l_name" value={formData.l_name} onChange={handleInputChange} required type="text" placeholder="Only characters..." />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">Please provide a Last Name.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col className='mb-2'>
              <Form.Group controlId="validationCustom04">
                <Form.Label>Avatar Image (optional)</Form.Label>
                <Form.Control name="image" type="file" onChange={handleImageChange} />
              </Form.Group>
            </Col>
          </Row>
            <div className='gender_input'>
              <label className='mb-2'>Gender</label>
              <div className='gender_dev'>
                <label className='Select_gender' htmlFor='genderMale'>
                  <span>Male</span>
                  <input id='genderMale' onChange={(e)=> setGender(e.target.value)} checked={gender === "Male"} name='gender' value={'Male'} type="radio" />
                </label>
                <label className='Select_gender' htmlFor='genderFemale'>
                  <span>Female</span>
                  <input id='genderFemale' onChange={(e)=> setGender(e.target.value)} checked={gender === "Female"} name='gender' value={'Female'} type="radio" />
                </label>
                <label className='Select_gender' htmlFor='genderNull'>
                  <span>Prefer not to say</span>
                  <input id='genderNull' onChange={(e)=> setGender(e.target.value)} checked={gender === ""} name='gender' value={""} type="radio" />
                </label>
              </div>
            </div>
            <Form.Group className='my-2'>
              <Form.Label>BIO (optional)</Form.Label>
              <Form.Control name="bio" onChange={handleInputChange} value={formData.bio} rows={5} as="textarea" maxLength={200} placeholder='description about yourself...' />
              <p className='mt-1'>{formData.bio.length}/200</p>
            </Form.Group>
            {error && <p className='text-danger my-2'>{error}</p>}
            <Button type="submit" className='btn-warning' disabled={updateLoading} >
              {updateLoading === false ? 'Update Profile' : <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              <span className=""> Loading...</span>
            </> }
          </Button>
          </Form>
          </Card.Body>
          </Card>
          <Card className="card_box">
            <Card.Header className='text-white border-bottom border-secondary'>Change Password</Card.Header>
            <Card.Body>
              <Form className='text-white' noValidate validated={validatedPasswordForm} onSubmit={handleSubmitChangePassword} >
              <Col className='mb-2'>
              <Form.Group controlId="validationCustom05">
                <Form.Label>Current Password</Form.Label>
                <Form.Control name="current_password" value={passwords.current_password} minLength={6} onChange={handlePasswordsChange} required type="password" placeholder='Your password' />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">Please provide your Current Password with at least 6 characters.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col className='mb-2'>
              <Form.Group controlId="validationCustom06">
                <Form.Label>New Password</Form.Label>
                <Form.Control name="new_password" value={passwords.new_password} minLength={6} onChange={handlePasswordsChange} required type="password" placeholder='At least 6 characters.' />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">Please provide a new password with at least 6 characters.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col className='mb-2'>
              <Form.Group controlId="validationCustom07">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control name="confirm_password" value={passwords.confirm_password} minLength={6} onChange={handlePasswordsChange} required type="password" placeholder='At least 6 characters.' />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">Please enter at least 6 characters for the Confirm Password.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            {passwordError && <p className='text-danger'>{passwordError}</p>}
            <Button type="submit" className='btn-warning mt-2' disabled={updatePasswordLoading} >
              {updatePasswordLoading === false ? 'Change Password' : <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              <span> Loading...</span>
            </> }
            </Button>
            </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default EditProfile;
