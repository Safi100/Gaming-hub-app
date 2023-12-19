import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { NotificationContext } from '../../context/NotificationContext'
import LoginFirst from '../../components/redirecting/LoginFirst'
import Alert from 'react-bootstrap/Alert';
import Axios from 'axios';
import './notifications.css'

const Notifications = () => {
    const authContext = useContext(AuthContext)
    const notificationContext = useContext(NotificationContext)
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        setNotifications(notificationContext.notifications)
    }, [notificationContext])
    
    const handleSubmit = (e) => {
        e.preventDefault();
        notificationContext.clearNotifications()
    }

    return (
        !authContext.currentUser ? <LoginFirst /> :
        <div className='wrapper py-4'>
            <h2>Notifications ({notifications.length})</h2>
            {notifications.length > 0 &&
                <form onSubmit={handleSubmit}>
                    <div className='d-flex gap-2 py-1 mb-2'>
                        <input id='check' type="checkbox" required />
                        <label htmlFor="check">Check before clear</label>
                    </div>
                    <button className='btn btn-danger'>Clear notifications</button>
                </form>
            }
            <div className='notifications py-4'>
                {notificationContext.notifications?.map((notification) => (
                    <a key={notification._id}
                        {...(notification.about === "giveaway" ? { href: `/giveaway/${notification.content_id}` } : {})}
                        {...(notification.about === "topic" ? { href: `/topic/${notification.content_id}` } : {})}
                        {...(notification.about === "follow" ? { href: `/profile/${notification.content_id}` } : {})}
                    >
                        <Alert className='mb-0' variant={"success"}>{notification.body}</Alert>
                    </a>
                ))}
            </div>
        </div>
    );
}

export default Notifications;