import {useState} from 'react';
import { Col, Form, Button, Spinner } from 'react-bootstrap';
import Axios from 'axios';
import './banForm.css';

const BanForm = ({user, setUser, setOpenConfirmBan, notify}) => {
    const [validated, setValidated] = useState(false)
    // State variable for input values
    const [formData, setFormData] = useState({
        days: "",
        reason: ""
    });
    const [error, setError] = useState('')
    // input change event
    const handleInputChange = (event) => {
        const { name, value } = event.target
        setFormData({
            ...formData,
            [name]: value.trimStart()
        });
    };
    // submit form
    const handleSubmit = (event) => {
        setValidated(true);
        const form = event.currentTarget;
        event.preventDefault()
        if (form.checkValidity() === false) {
          event.stopPropagation()
        }else{
            setError('')
            Axios.post(`http://localhost:8000/api/user/ban-user/${user._id}`, {...formData})
            .then((res) => {
                setUser((prevUser) => ({
                    ...prevUser,
                    isBanned: true,
                }))
                setOpenConfirmBan(false)
                notify("User banned successfully!")
            })
            .catch((err) =>{
                console.log(err)
                setError(err.response.data)
            })
        }
    }

    return (
        <div className='blur'>
        <Form className='ban_form my-5 p-3' noValidate validated={validated} onSubmit={handleSubmit} >
            <h2 className='mb-3 fs-5'>Ban user: {user.first_name} {user.last_name}</h2>
            <Form.Group as={Col} className='mb-3' md="12" controlId="validationCustom01">
                <Form.Label>Number of days <span className='text-warning'>*Leave it blank if you want to ban permanent</span></Form.Label>
                <Form.Control name="days" value={formData.days} onChange={handleInputChange} type="number" placeholder='Enter a number of days for ban...' />
            </Form.Group>
            <Form.Group as={Col} className='mb-1' md="12" controlId="validationCustom02">
                <Form.Label>Ban reason</Form.Label>
                <Form.Control className='textarea' name="reason" value={formData.reason} onChange={handleInputChange} rows={6} required as="textarea" placeholder='Type a reason for ban...' />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">Please provide a reason for ban.</Form.Control.Feedback>
            </Form.Group>
            {error && <p className='text-danger mb-3'>{error}</p>}
            <div className='d-flex gap-2 mt-3'>
                <Button type="submit" className='btn-primary'>Confirm Ban</Button>
                <Button className='btn-danger' onClick={()=> setOpenConfirmBan(false)}>Close</Button>
            </div>
        </Form>
        </div>
    );
}

export default BanForm;
