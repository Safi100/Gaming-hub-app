const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema({
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      default: null,
    }, // Content could be the text description of the message.
    isFromSystem: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }
});

// create message model
module.exports = mongoose.model('Message', messageSchema);