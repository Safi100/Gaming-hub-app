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
