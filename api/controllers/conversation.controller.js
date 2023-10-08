const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const CryptoJS = require('crypto-js');
const HandleError = require('../utils/HandleError');

module.exports.Create_Group_Conversation = async (req, res, next) => {
    try {
        const group_title = req.body.group_title.trim();
        const newGroupConversation = new Conversation({
            type: 'group',
            title: group_title,
            unreadCount: { [req.user.id]: 0}
        })
        newGroupConversation.participants.push(req.user.id);
        newGroupConversation.admins.push(req.user.id);
        newGroupConversation.save();
        res.status(200).json(newGroupConversation)
    } catch (e) {
        next(e);
    }
}
// get all current user's conversations that have at least one message
module.exports.Conversation_List = async (req, res, next) => {
    const conversations = await Conversation.find({ messages: { $exists: true, $not: { $size: 0 } }, participants: { $in: [req.user.id] }, })
    .populate({path: 'messages', options: { sort: { timestamp: -1 }, limit: 1 }, // Sort messages by timestamp in descending order and limit to 1 message
        populate: { // popluate sender of messages without his password
          path: 'sender',
          select: '-password',
        },
    }).exec()
    // sort conversations by by the most recent message's timestamp
    conversations.sort((a, b) => {
      const timestampA = a.messages.length > 0 ? a.messages[0].timestamp : 0;
      const timestampB = b.messages.length > 0 ? b.messages[0].timestamp : 0;
      return timestampB - timestampA;
    });
    res.status(200).json(conversations);
}
