import {useState, useEffect, useContext} from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import Axios from 'axios'
import io from '../../components/socket';

const GiveawayCard = ({ giveaway, notify }) => {
    const [currentGiveaway, setCurrentGiveaway] = useState(giveaway);
    const authContext = useContext(AuthContext)

    // check if currentUser already participate in this giveaway 
    const isCurrentUserParticipant = currentGiveaway.participants.some(
        (participant) => participant._id === authContext.currentUser._id
    );

    const joinGiveaway = () => {
        if(!authContext.currentUser) return;
        Axios.post(`http://localhost:8000/api/giveaway/join/${currentGiveaway._id}`)
        .then((res) => {
            io.emit('joinGiveaway', { giveawayID: currentGiveaway._id})
            notify()
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
        <div className='giveaway_card p-3'>
            <h2 className='fs-5'>{currentGiveaway.heading}</h2>
            <p className='mb-2'>Participants: {currentGiveaway.participants.length}/{currentGiveaway.max_participants}</p>
            <p className='mb-2'>Closed on: {new Date(currentGiveaway.winner_announcement_date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
            <div className='giveaway_buttons mt-4'>
                {authContext.currentUser &&
                <button onClick={joinGiveaway} 
                disabled={currentGiveaway.max_participants === currentGiveaway.participants.length || isCurrentUserParticipant} 
                className='btn btn-success'>Join Giveaway
                </button> 
                }
                <a className='btn btn-secondary' href={`/giveaway/${currentGiveaway._id}`}>See more</a>
            </div>
        </div>
    );
}

export default GiveawayCard;