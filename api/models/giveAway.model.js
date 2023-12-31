const mongoose = require('mongoose')
const Schema = mongoose.Schema

const giveAwaySchema = new Schema({
    heading: {
        type: String,
        required: [true, 'heading is required']
    },
    body: {
        type: String,
        default: null
    },
    game: {
        type: Schema.Types.ObjectId,
        ref: 'Game',
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    max_participants: {
        type: Number,
        required: [true, 'max_participants is required'],
        min: 1
    },
    winner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    winner_announcement_date: {
        type: Date,
        required: [true, 'winner_announcement_date is required']
    }
})

module.exports = mongoose.model('GiveAway', giveAwaySchema)