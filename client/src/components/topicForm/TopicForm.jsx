import {useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import './topicForm.css';
import { Col, Form, Button, Spinner } from 'react-bootstrap';

const TopicForm = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const [validated, setValidated] = useState(false)
    const [addingLoading, setAddingLoading] = useState(false)
    // State variable for input values
    const [formData, setFormData] = useState({
        subject: "",
        topic_body: ""
    });
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
            setAddingLoading(true)
            Axios.post(`http://localhost:8000/api/topic/${id}`, {...formData})
            .then((res) => {
                setAddingLoading(false)
                navigate(`/topic/${res.data.topicID}`)
                console.log(res)
            })
            .catch((err) =>{
                setAddingLoading(false)
                console.log(err)
            })
        }
    }

    return (
        <Form className='newTopic_form my-5 p-3' noValidate validated={validated} onSubmit={handleSubmit} >
            <h2 className='mb-3 fs-5'>Share Your Gaming Experiences and Insights</h2>
            <Form.Group as={Col} className='mb-3' md="12" controlId="validationCustom01">
                <Form.Label>Subject</Form.Label>
                <Form.Control name="subject" value={formData.subject} onChange={handleInputChange} required type="text" placeholder='Type a subject for your new topic...' />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">Please provide a topic subject.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} className='mb-3' md="12" controlId="validationCustom02">
                <Form.Label>Topic body</Form.Label>
                <Form.Control className='textarea' name="topic_body" value={formData.topic_body} onChange={handleInputChange} rows={6} required as="textarea" placeholder='Type a body content for your new topic...' />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">Please provide a body text.</Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" className='btn-success' disabled={addingLoading} >
            {addingLoading === false ? 'Post new topic' : <>
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
    );
}

export default TopicForm;
