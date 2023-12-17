import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import io from '../../components/socket'
import { AuthContext } from '../../context/AuthContext';
import { stringAvatar } from '../../components/avatar';
import Avatar from '@mui/material/Avatar';
import CommentForm from '../../components/topicForm/commentForm'
import PageLoading from '../../components/loading/PageLoading'
import Axios from 'axios'
import './topic.css'

const Topic = () => {
    const authContext = useContext(AuthContext)
    const [topic, setTopic] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const {id} = useParams()

    useEffect(() => {
        // Listen for the "NewComment" event from the server
        io.on('NewComment', ({topicID, comment}) => {
            // Update the state using a functional update to ensure you have the latest state
            // if (topicID === topic._id) {
                setTopic((prevTopic) => ({
                    ...prevTopic,
                    comments: comment,
                }));
            // }
        });
        // Clean up the socket event listener when the component unmounts
        return () => {
            io.off('NewComment');
        };
    }, [io]);

    useEffect(() => {
        Axios.get(`http://localhost:8000/api/topic/${id}`)
        .then(res => {
            setLoading(false)
            console.log(res.data)
            setTopic(res.data)
        })
        .catch(err => {
            setLoading(false)
            setError(err.res.data)
            console.log(err)
        })
    }, [id])

    return (
        loading ? <PageLoading /> :
        <div className='wrapper'>
            {error ? <h2 className='text-danger'>{error}</h2>
            :
            <div className="topic_info py-4">
                <h2 className='mb-4'>Topic for <a className='text-success' href={`/game/${topic.topic_for?._id}`}>{topic.topic_for?.title}</a></h2>
                <Card className='topic_card'>
                <Card.Header>{topic.subject}</Card.Header>
                <Card.Body>
                    <Card.Text><p dangerouslySetInnerHTML={{ __html: topic.topic_body?.replace(/\n/g, '<br>')}} /></Card.Text>
                </Card.Body>
                <Card.Footer>Created on {new Date(topic.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' , hour: 'numeric', minute: 'numeric'})}</Card.Footer>
                </Card>
                <CommentForm />
                <div className='comments'>
                    {topic.comments?.map((comment) => (
                        <Card className='topic_card' key={comment._id}>
                            <Card.Header className='d-flex align-items-center justify-content-between'>
                                <div className='d-flex gap-2 align-items-center'>
                                    <div>{comment.author.avatar ? <img className='avatar' src={comment.author.avatar?.url} alt="avatar url" /> : 
                                        <Avatar variant='square' {...stringAvatar(`${comment.author?.first_name} ${comment.author?.last_name}`)} />                                    
                                    }</div>
                                    <div>
                                        <p>{comment.author.first_name} {comment.author.last_name} {comment.author.isAdmin && <span className='admin px-2 bg-primary'>Admin</span>}</p>
                                        <p>{comment.author.email}</p>
                                    </div>
                                </div>
                                {/* Delete comment */}
                                {authContext.currentUser && authContext.currentUser?._id == comment.author._id && 
                                    <form>
                                        <button className='btn btn-danger'>Delete</button>
                                    </form>
                                }
                            </Card.Header>
                            <Card.Body>
                                <Card.Text><p dangerouslySetInnerHTML={{ __html: comment.body?.replace(/\n/g, '<br>')}} /></Card.Text>
                            </Card.Body>
                            <Card.Footer>{new Date(comment.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' , hour: 'numeric', minute: 'numeric', second: 'numeric'})}</Card.Footer>
                        </Card>
                    ))}
                </div>
            </div>
            }
        </div>
    );
}

export default Topic;
