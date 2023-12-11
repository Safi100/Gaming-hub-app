import {useState, useContext, useEffect} from 'react';
import { AuthContext } from '../../context/AuthContext';
import Axios from 'axios'
import LoginFirst from '../../components/redirecting/LoginFirst';
import './giveaway.css'
const MyGiveaway = () => {
    const authContext = useContext(AuthContext)
    const [giveaways, setGiveaways] = useState([]);

    useEffect(() => {
        Axios.get('http://localhost:8000/api/giveaway/my-giveaway')
        .then((res) => {
            setGiveaways(res.data)  
        })
        .catch(err => console.log(err))
    }, [])


    return (
        (!authContext.currentUser) ? <LoginFirst /> :
        <div className='wrapper'>
            <div className='giveaway_row mt-4'>
                {giveaways.map(giveaway => (

                    <div className='giveaway_card p-3'>
                        <h2 className='fs-5'>{giveaway.heading}</h2>
                        <p className='mb-2'>Participants: {giveaway.participants.length}/{giveaway.max_participants}</p>
                        {/* Determine if the giveaway has ended by comparing the current date to the announcement date */}
                        {new Date() <= new Date(giveaway.winner_announcement_date) ?
                        <p className='mb-2'>Close on: {new Date(giveaway.winner_announcement_date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
                        :
                        <p className='mb-2 text-danger'>Ended on : {new Date(giveaway.winner_announcement_date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
                        }
                        <p className='mb-4'>Winner: <a className='text-warning' href={`/profile/${giveaway.winner?._id}`}>{giveaway.winner?.first_name} {giveaway.winner?.last_name}</a></p>
                        <a className='btn btn-secondary' href={`/giveaway/${giveaway._id}`}>See more</a>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyGiveaway;
