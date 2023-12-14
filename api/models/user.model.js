const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    avatar: {
        url: {
            type: String,
        },
        filename: {
            type: String,
        }
    },
    first_name: {
        type: String,
        required: [true, "Last Name is required"]
    },
    last_name: {
        type: String,
        required: [true, "First Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    gender: {
        type: String,
        enum : ['Male','Female', null],
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    bio: {
        type: String,
        default: '',
        maxlength: 200  // Maximum character limit for the bio
    },
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    favorite_games: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Game'  
        }
    ],
    topics: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Topic'
        }
    ],
    notifications: [
        {
            about: {
                type: String,
                enum: ['follow', 'topic', 'comment', 'reply', 'giveaway']
            },
            content_id: {
                type: String,
                // required: true
            },
            body: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: new Date()
            },
        }
    ]
}, {timestamps: true})

module.exports = mongoose.model('User', userSchema)