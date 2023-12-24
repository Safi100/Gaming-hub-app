import React from 'react';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import NotAuthorize from '../../../components/redirecting/NotAuthorize';
import Axios from 'axios'
import PageLoading from '../../../components/loading/PageLoading';
import { ToastContainer, toast } from 'react-toastify';
import './bannedUsers.css';

const BannedUsers = () => {
    const authContext = useContext(AuthContext)
    const [bannedUsers, setBannedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const notify = (title) => {
        toast(`${title}`, {
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
        Axios.get('http://localhost:8000/api/user/banned-users')
        .then(res => {
            setLoading(false);
            setBannedUsers(res.data);
        })
        .catch(err => {
            setLoading(false);
            console.log(err);
        })
    }, [])

    const removeBanFromUser = (e, user) => {
        e.preventDefault();
        Axios.delete(`http://localhost:8000/api/user/ban-user/${user}`)
        .then(res => {
            setBannedUsers(prevBannedUsers => 
                prevBannedUsers.filter(bannedUser => bannedUser._id !== res.data._id)
            );
            notify('Banned removed successfully!')
        })
        .catch(err => console.log(err))
    }

    return (
        loading ? <PageLoading /> :
        (!authContext.currentUser || !authContext.currentUser.isAdmin) ? <NotAuthorize /> :
        <>
        <ToastContainer/>
        <div className='wrapper py-3'>
            <h2 className='mb-4'>Banned Users ({bannedUsers.length})</h2>
            <div className='users_banned'>
                {bannedUsers.map(bannedUser => (
                    <div className='banned_card' key={bannedUser._id}>
                        <p className='mb-2'><a className='fs-5' href={`/profile/${bannedUser.user._id}`}>{bannedUser.user.first_name} {bannedUser.user.last_name} / {bannedUser.user.email}</a></p>
                        <p>Ban from <span className='text-warning'>{new Date(bannedUser.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' , hour: 'numeric', minute: 'numeric', second: 'numeric'})}</span></p>
                        <p className='mb-2'>to <span className='text-warning'>{bannedUser?.bannedUntil ==  null  ? 'Forever' : new Date(bannedUser?.bannedUntil).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' , hour: 'numeric', minute: 'numeric', second: 'numeric'})}</span></p>
                        <div className='mb-4'>
                            <p>Ban reason:</p>
                            <p dangerouslySetInnerHTML={{ __html: bannedUser.reason.replace(/\n/g, '<br>') }} />
                        </div>
                        <form onSubmit={(e) => removeBanFromUser(e, bannedUser.user._id)}>
                            <div className='d-flex gap-2 mb-2'>
                                <input type="checkbox" id='delete' required />
                                <label htmlFor="delete">Check before delete</label>
                            </div>
                            <button className='btn btn-danger d-block'>Remove ban</button>
                        </form>
                    </div>
                ))}
            </div>
        </div>
        </>
    );
}

export default BannedUsers;
