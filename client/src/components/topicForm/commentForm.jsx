import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Col, Form, Spinner } from 'react-bootstrap'
import io from '../../components/socket'
import Axios from 'axios'
import './topicForm.css'

const CommentForm = () => {
    const {id} = useParams()
    const [comment, setComment] = useState('')
    const [validated, setValidated] = useState(false)
    const [addingLoading, setAddingLoading] = useState(false)

    const handleCommentChange = (e) => {
        const text = e.target.value.trimStart()
        setComment(text)
    }
    // submit comment form
    const handleSubmit = (event) => {
        setValidated(true);
        const form = event.currentTarget;
        event.preventDefault()
        if (form.checkValidity() === false) {
          event.stopPropagation()
        }else{
            setAddingLoading(true)
            Axios.post(`http://localhost:8000/api/topic/${id}/comment`, {comment_body: comment})
            .then((res) => {
                setAddingLoading(false)
                io.emit('NewComment', {topicID: id})
                setComment('')
            })
            .catch((err) =>{
                setAddingLoading(false)
                console.log(err)
            })
            setValidated(false)
        }
    }

    return (
        <Form className='newTopic_form my-3 p-3' noValidate validated={validated} onSubmit={handleSubmit} >
            <Form.Group as={Col} className='mb-3' md="12" controlId="validationCustom02">
                <Form.Control className='textarea' name="topic_body" value={comment} onChange={handleCommentChange} rows={5} required as="textarea" placeholder='Type a body content for your new comment...' />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">Please provide a body comment.</Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" className='btn-success' disabled={addingLoading} >
            {addingLoading === false ? 'Add comment' : <>
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

export default CommentForm;
