const mongoose = require('mongoose')
const Schema = mongoose.Schema

const topicSchema = new Schema({
    subject: {
        type: String,
        required: [true, 'heading is required']
    },
    topic_body: {
        type: String,
        required: [true, 'body is required']
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'author is required']
    },
    topic_for: {
        type: Schema.Types.ObjectId,
        ref: 'Game',
        required: [true, 'game is required']
    },
    comments: [
        {
            author: {
                type: Schema.Types.ObjectId,
                ref: 'User'  
            },
            body: {
                type: String,
                required: [true, 'Body is required']
            }
        }
    ]
}, {timestamps: true})

module.exports = mongoose.model('Topic', topicSchema);