import React from 'react'
import './help.css'

const Help = () => {
    return (
        <div className='wrapper help py-3'>
            <h2 className='mb-3'>How to use website</h2>
            <div>
                <h3>Register</h3>
                <ul className='px-4'>
                    <li>After register with unique email you will recieve a verification link on your email - check spam folder.</li>
                    <li>Your account will be deleted after 24 hours if you don't verify it.</li>
                </ul>
            </div>
            <div>
                <h3>Login</h3>
                <ul className='px-4'>
                    <li>Before you can sign in, you need to verify your email.</li>
                    <li>After login, I suggest you to set bio, it help users know who you are.</li>
                </ul>
            </div>
            <div>
                <h3>Profile</h3>
                <ul className='px-4'>
                    <li>You can change your info from your profile settings.</li>
                    <li>Email change not provided yet...</li>
                </ul>
            </div>
            <div>
                <h3>Chat</h3>
                <ul className='px-4'>
                    <li>You can communicate with users during private/group conversation.</li>
                    <li>In group conversation, group admin can add or kick participants.</li>
                </ul>
            </div>
            <div>
                <h3>Games</h3>
                <ul className='px-4'>
                    <li>If you can't find your game, send a message to admins and suggest it.</li>
                    <li>You can find games on home page or search it on search bar.</li>
                    <li>You will recieve notification about new giveaway of game if you added it to favorite.</li>
                </ul>
            </div>
            <div>
                <h3>Giveaways</h3>
                <ul className='px-4'>
                    <li>Only admins can add a new giveaway.</li>
                    <li>Logged in users can join a giveaway.</li>
                    <li>The winner will be randomly selected from the system after the specified time ends.</li>
                    <li>The winner will be contacted by the admin to receive the prize.</li>
                    <li>You can find your giveaways in my giveaway page.</li>
                </ul>
            </div>
            <div>
                <h3>Topics</h3>
                <ul className='px-4'>
                    <li>You can create or view topic from game page.</li>
                    <li>You can edit/delete topic from your profile.</li>
                    <li>You will receive a notification about new topic for user if you followed him.</li>
                    <li>You can comment on topic inside topic page.</li>
                    <li>Admin will remove your topic/comment if it contains (Religious, political and racist) content</li>
                </ul>
            </div>
        </div>
    );
}

export default Help;
