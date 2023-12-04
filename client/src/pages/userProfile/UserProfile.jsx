import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom'
import Axios from 'axios'
import PageLoading from '../../components/loading/PageLoading';
import Avatar from '@mui/material/Avatar';
import MessageIcon from '@mui/icons-material/Message';
import { stringAvatar } from '../../components/avatar';
import { AuthContext } from '../../context/AuthContext'; 
import './userProfile.css'
import EditProfile from './EditProfile';

const UserProfile = () => {
    const navigate = useNavigate()
    // get current user
    const [currentUser, setCurrentUser] = useState(null);
    const authContext = useContext(AuthContext);
    useEffect(() => {
        setCurrentUser(authContext.currentUser);
    }, [authContext]);

    const {id} = useParams()
    const [user, setUser] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [openEdit, setOpenEdit] = useState(false);
    // fetch user profile data
    useEffect(() => {
        setOpenEdit(false)
        setError('')
        setLoading(true)
        Axios.get(`http://localhost:8000/api/user/profile/${id}`)
        .then((res) => {
            setUser(res.data)
            setLoading(false)
        })
        .catch(err => {
            setError(err.response.data)
            setLoading(false)
        })
    }, [id])

    // following status
    const isFollower = user.followers?.some(follower => follower._id === currentUser?._id)
    // follow function
    const following_toggle = () => {
        Axios.post(`http://localhost:8000/api/user/toggle-following-user/${user._id}`)
        .then((res) => {
            // response contains the updated followers array only.
            setUser((prevUser) => ({
              ...prevUser,
              followers: res.data,
            }));
          })
          .catch((err) => {
            // Handle any errors that occur during the API request.
            console.error(err);
          });
    }
    // contact function
    const FetchOrCreateConversation = (receiverUserId) => {
        Axios.post(`http://localhost:8000/api/conversation/create-or-fetch-private-conversation`, {receiverUserId})
        .then(res => {
            navigate(`/chat/${res.data}`)
        })
        .catch((err) => console.log(err))
    }

    return (
        <div className='user_profile'>
            {console.log(user)}
            {loading ? <PageLoading /> :
            <div className="wrapper">
            {error ? <h2 className='error'>{error}</h2> :
            <>
                <div className='profile_header'>
                    <div className="avatar">
                        {user.avatar ?
                            <img src={user.avatar?.url} alt={`${user.first_name} ${user.last_name} avatar image`} />
                        :
                            <Avatar variant='square' {...stringAvatar(`${user.first_name} ${user.last_name}`)} />
                        }
                    </div>
                    <div className="user_info">
                        <h2 className='user_full_name'>{user.first_name} {user.last_name} {user.isAdmin && <span className='admin'>Admin</span>}</h2>
                        <div className='follow_div'>
                            <p>Followers: {user.followers?.length}</p>
                            { (currentUser && currentUser._id !== user._id) && (
                                isFollower ?
                                <button onClick={following_toggle} className=' follow_status_btn unfollow'>unfollow</button>
                                :
                                <button onClick={following_toggle} className=' follow_status_btn follow'>follow</button>
                            )}
                        </div>
                        <p>{user.email}</p>
                        <p>{user.gender}</p>
                        <p>Joined at {new Date(user.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
                        <div className='buttons'>
                            { (currentUser && currentUser._id !== user._id) && ( <>
                                <button className='contact' onClick={() => FetchOrCreateConversation(user._id) } ><MessageIcon /> Contact</button>
                                <button className='report'>Report</button>
                            </> )}
                            { (currentUser && currentUser._id === user._id) && (
                                <button className='edit_btn' onClick={()=> setOpenEdit(true)}>Edit profile</button>
                            )}
                        </div>
                    </div>
                </div>
                <div className='profile_main'>
                    <div className="topics">ddd</div>
                    <div className="about_user">
                        <Card className="bio">
                            <Card.Header className='fs-5'>About {user.first_name} {user.last_name}</Card.Header>
                            <Card.Body>{user.bio?.length > 0 ? user.bio : `No bio yet...` }</Card.Body>
                        </Card>
                        <Card className='favorite_games'>
                            <Card.Header className='fs-5'>Favorite games</Card.Header>
                            <Card.Body>
                            {user.favorite_games?.length > 0 ? user.favorite_games?.map(game => (
                                <p className='fs-10 mb-1'><Link to={`/game/${game._id}`} >{game.title}</Link></p>
                                ))
                                :
                                <p>No favorite games yet...</p>
                            }
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </>
            }
            </div>
            }
            {currentUser && currentUser._id === user._id && 
            (openEdit && <EditProfile  user={user} setUser={setUser} setOpenEdit={setOpenEdit} />) }
        </div>
    );
}

export default UserProfile;
