const mongoose = require('mongoose')
const Schema = mongoose.Schema

const emailTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date(),
        expires: 3600 // 1 hour
    } 
})

module.exports = mongoose.model('EmailToken', emailTokenSchema)