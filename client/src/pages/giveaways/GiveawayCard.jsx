import {useState, useEffect, useContext} from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import Axios from 'axios'
import io from '../../components/socket';

const GiveawayCard = ({ giveaway, notify }) => {
    const [currentGiveaway, setCurrentGiveaway] = useState(giveaway);
    const authContext = useContext(AuthContext)
    const [confirmDelete, setConfirmDelete] = useState(false)

    // check if currentUser already participate in this giveaway 
    const isCurrentUserParticipant = currentGiveaway.participants.some(
        (participant) => participant._id === authContext.currentUser?._id
    );
    // join giveaway 
    const joinGiveaway = () => {
        if(!authContext.currentUser) return;
        Axios.post(`http://localhost:8000/api/giveaway/join/${currentGiveaway._id}`)
        .then((res) => {
            io.emit('joinGiveaway', { giveawayID: currentGiveaway._id})
            notify()
        })
        .catch(err => console.log(err))
    }
    // delete giveaway 
    const deleteGiveaway = (e) => {
        e.preventDefault();
        Axios.delete(`http://localhost:8000/api/giveaway/${giveaway._id}`)
        .then(() => {
            io.emit('deleteGiveaway', {giveawayID: giveaway._id});
            setConfirmDelete(false);
        })
        .catch(err => console.log(err))
    }

    useEffect(() => {
        // Listen for the "joinGiveaway" event from the server
        io.on('joinGiveaway', ({ giveawayID, Participants }) => {
            // Update the state with the new participants count
            if (giveawayID === currentGiveaway._id) {
                setCurrentGiveaway((prevGiveaway) => ({
                    ...prevGiveaway,
                    participants: Participants,
                }));
            }
        });
        // Clean up the socket event listener when the component unmounts
        return () => {
            io.off('joinGiveaway');
        };
    }, [currentGiveaway._id, io]);
    
    return (
        <>
        { confirmDelete &&     
        <div className='deleteGiveawayForm_blur'>
            <div className='deleteGiveawayForm'>
                <h3 className='mb-3'><span className='mb-1 d-block'>Confirm Delete giveaway</span>({giveaway.heading})</h3>
                <div className='d-flex gap-3'>
                    <button className='btn btn-danger' onClick={deleteGiveaway}>Confirm Delete</button>
                    <button className='btn btn-light' onClick={()=> setConfirmDelete(false)}>close</button>
                </div>
            </div>
        </div>}

        <div className='giveaway_card p-3'>
            <h2 className='fs-5'>{currentGiveaway.heading}</h2>
            <p className='mb-2'>Participants: {currentGiveaway.participants.length}/{currentGiveaway.max_participants}</p>
            <p className='mb-2'>Closed on: {new Date(currentGiveaway.winner_announcement_date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
            <div className='giveaway_buttons mt-4 mb-4'>
                {authContext.currentUser &&
                <button onClick={joinGiveaway} 
                disabled={currentGiveaway.max_participants === currentGiveaway.participants.length || isCurrentUserParticipant} 
                className='btn btn-success'>Join Giveaway
                </button> 
                }
                <a className='btn btn-secondary' href={`/giveaway/${currentGiveaway._id}`}>See more</a>
            </div>
            {authContext.currentUser.isAdmin &&
            <div className='d-flex gap-2'>
                <a className='btn btn-outline-primary' href={`/admin/edit-giveaway/${giveaway._id}`}>Edit giveaway</a>
                <button className='btn btn-outline-danger' onClick={()=> setConfirmDelete(true)}>Delete giveaway</button>
            </div>
            }
        </div>
        </>
    );
}

export default GiveawayCard;