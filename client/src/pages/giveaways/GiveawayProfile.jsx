import React, { useEffect, useState, useContext } from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify'
import Axios from 'axios'
import io from '../../components/socket'
import PageLoading from '../../components/loading/PageLoading'
import './giveaway.css'

const GiveawayProfile = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [giveaway, setGiveaway] = useState({})

    const authContext = useContext(AuthContext)

    // check if currentUser already participate in this giveaway 
    const isCurrentUserParticipant = giveaway.participants?.some(
        (participant) => participant._id === authContext.currentUser?._id
    );
    // Calculate the current date and time
    const currentDate = new Date();
    // Determine if the giveaway has ended by comparing the current date to the announcement date
    const isGiveawayEnded = currentDate >= new Date(giveaway.winner_announcement_date);


    // toast
    const notify = () => {
        toast("Joined giveaway successfully!", {
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

    useEffect(() => {
        Axios.get(`http://localhost:8000/api/giveaway/${id}`)
        .then(res => {
            setLoading(false)
            setGiveaway(res.data)
            console.log(res.data)
        })
        .catch(err => {
            console.log(err)
            setLoading(false)
            setError(err.response.data)
        })
    }, [id])

    const joinGiveaway = () => {
        if(!authContext.currentUser) return;
        Axios.post(`http://localhost:8000/api/giveaway/join/${giveaway._id}`)
        .then((res) => {
            io.emit('joinGiveaway', { giveawayID: giveaway._id})
            notify()
        })
        .catch(err => console.log(err))
    }
    useEffect(() => {
        // Listen for the "joinGiveaway" event from the server
        io.on('joinGiveaway', ({ giveawayID, Participants }) => {
            // Update the state with the new participants count
            if (giveawayID === giveaway._id) {
                setGiveaway((prevGiveaway) => ({
                    ...prevGiveaway,
                    participants: Participants,
                }));
            }
        });
        // Clean up the socket event listener when the component unmounts
        return () => {
            io.off('joinGiveaway');
        };
    }, [giveaway._id, io]);

    const deleteGiveaway = (e) => {
        e.preventDefault();
        Axios.delete(`http://localhost:8000/api/giveaway/${id}`)
        .then(() => {
            io.emit('deleteGiveaway', {giveawayID: giveaway._id});
            navigate('/giveaway?page=1&gameCategory=')
        })
        .catch(err => console.log(err))
    }

    return (
        loading ? <PageLoading /> :
        <>
        <ToastContainer />
        <div className='wrapper giveaway_profile'>
            {error && <h2 className='fs-1 text-danger mt-4'>{error}</h2>}
            <div className='py-4'>
            <img className='w-100 mb-3' src={giveaway.game.cover_photo.url} alt="" />
            <h2>Giveaway for <a className='text-success' href={`/game/${giveaway.game._id}`}>{giveaway.game.title}</a></h2>
            <div className='mt-4 giveaway_profile_row'>
                <div className='giveaway_info mt'>
                    <h2 className='fs-5 mb-3'>{giveaway.heading}</h2>
                    {giveaway.body.length > 0 ? 
                    <p dangerouslySetInnerHTML={{ __html: giveaway.body.replace(/\n/g, '<br>')}} />
                    : <p>No body information</p>
                }
                    <p className='mt-2'>Participants: {giveaway.participants.length}/{giveaway.max_participants}</p>
                    {
                    isGiveawayEnded ? 
                    <p className='my-2 text-danger'>The giveaway ended on {new Date(giveaway.winner_announcement_date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
                    : 
                    <p className='my-2'>Winner announcement at <span className='text-primary'>{new Date(giveaway.winner_announcement_date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</span></p>
                    }
                    {giveaway.winner && <p className='mb-4'>Winner: <a className='text-warning' href={`/profile/${giveaway.winner?._id}`}>{giveaway.winner?.first_name} {giveaway.winner?.last_name}</a></p>}
                    { authContext.currentUser &&
                    <button onClick={joinGiveaway} 
                    disabled={giveaway.max_participants === giveaway.participants.length || isCurrentUserParticipant} 
                    className='btn btn-success mt-2'>Join Giveaway
                    </button> 
                    }
                    { authContext.currentUser?.isAdmin &&
                        <div className='mt-4 d-flex flex-column gap-3'>
                            <div><a className='btn btn-outline-primary' href={`/admin/edit-giveaway/${giveaway._id}`}>Edit giveaway</a></div>
                            <div className="card delete_card">
                                {/* Delete giveaway form */}
                                <form className="card-body" onSubmit={deleteGiveaway}>
                                    <h5 className="card-title mb-2">Delete giveaway</h5>
                                    <div className='d-flex gap-2 mb-2'>
                                        <input type="checkbox" id='delete' required/>
                                        <label htmlFor="delete">Check this before delete</label>
                                    </div>
                                    <div><button href="#" className="btn btn-danger">Delete</button></div>
                                </form>
                            </div>
                        </div>
                    }
                </div>
                <div className="participants">
                    {giveaway.participants?.length > 0 && <>
                    <h3 className='mb-3'>Participants: </h3>
                    <div className='par_row'>
                        {giveaway.participants?.map(participant => (
                            <a href={`/profile/${participant._id}`} className='participant' key={participant._id}>
                                <div><img src={participant.avatar.url} alt="avatar url" /></div>
                                <div>
                                    <p>{participant.first_name} {participant.last_name} {authContext.currentUser?._id === participant._id && <span className='me bg-primary'>me</span>}</p>
                                    <p>{participant.email}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                    </>}
                </div>
            </div>
            </div>
        </div>
    </>
    );
}

export default GiveawayProfile;
