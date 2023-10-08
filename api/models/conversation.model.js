const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Conversation schema
const conversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['private', 'group'],
    required: true,
  },
  title: { // Name for group conversations
    type: String,
    default: null,
  },
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }],
  unreadCount: {} // Number of unread messages in the conversation
}, {timestamps: true});

// Create models Conversation
module.exports = mongoose.model('Conversation', conversationSchema);