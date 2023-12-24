const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const userBannedSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: [true, 'user already banned'],
        required: [true, 'user is required']
    },
    bannedUntil: {
        type: Date,
        default: null // null (forever ban) or a specific date
    },
    reason: {
        type: String,
        required: [true, 'reason is required']
    },
}, { timestamps: true });

module.exports = mongoose.model('BannedUser', userBannedSchema);
