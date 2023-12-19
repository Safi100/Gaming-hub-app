import {useEffect, useState, useContext} from 'react'
import { useParams } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import { Col, Form, Button, Spinner } from 'react-bootstrap'
import { AuthContext } from '../../context/AuthContext'
import PageLoading from '../../components/loading/PageLoading'
import NoPermission from '../../components/redirecting/NoPermission'
import Axios from 'axios'
import './editTopic.css'
const EditTopic = () => {
    const {id} = useParams()
    const [validated, setValidated] = useState(false)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState('')
    const [topic, setTopic] = useState({})

    const authContext = useContext(AuthContext)

    // State variable for input values
    const [formData, setFormData] = useState({
        subject: "",
        topic_body: ""
    });

    useEffect(() => {
        Axios.get(`http://localhost:8000/api/topic/${id}`)
        .then(res => {
            setPageLoading(false)
            setTopic(res.data)
            setFormData({
                subject: res.data.subject,
                topic_body: res.data.topic_body
            })
        })
        .catch(err => {
            setPageLoading(false)
            setError(err.response.data)
        })
    }, [id])

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
            setUpdateLoading(true)
            Axios.put(`http://localhost:8000/api/topic/${id}`, {...formData})
            .then((res) => {
                setUpdateLoading(false)
                setValidated(false)
                notify()
            })
            .catch((err) =>{
                setUpdateLoading(false)
                setValidated(false)
                setError(err.response.data)
            })
        }
    }

    // toast
    const notify = () => {
        toast("Topic updated successfully!", {
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

    return (
        pageLoading ? <PageLoading /> :
        <div className='wrapper'>
        <ToastContainer />
        {error ? <h2 className='text-danger py-5'>{error}</h2>
        :
        !(topic.author?._id == authContext.currentUser?._id) ? <NoPermission /> : 
        <Form className='editTopic_form py-5' noValidate validated={validated} onSubmit={handleSubmit} >
            <div className='mb-5'>
                <h2 className='fs-5'>Update your topic</h2>
                <p>visit your topic <a className='text-success' href={`/topic/${topic._id}`}>here</a></p>
            </div>
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
            <Button type="submit" className='btn-success' disabled={updateLoading} >
            {updateLoading === false ? 'Update topic' : <>
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
        }
        </div>
    );
}

export default EditTopic;
