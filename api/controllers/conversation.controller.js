const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const CryptoJS = require('crypto-js');
const HandleError = require('../utils/HandleError');
const mongoose = require('mongoose');

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
    try{
        const io = req.app.get('socketio');
        const conversations = await Conversation.find({ messages: { $exists: true, $not: { $size: 0 } }, participants: { $in: [req.user.id] } })
        .populate({path: 'messages', options: { sort: { timestamp: -1 }, perDocumentLimit: 1 }, // Sort messages by timestamp in descending order and limit to 1 message
            populate: { // popluate sender of messages without his password
              path: 'sender',
              select: ['first_name', 'last_name', 'isAdmin'],
            },
        }).populate({path: 'participants', match: { _id: { $ne: req.user.id }},
            select: ['first_name', 'last_name', 'avatar']
        })
        .exec()
        // sort conversations by by the most recent message's timestamp
        conversations.sort((a, b) => {
          const timestampA = a.messages.length > 0 ? a.messages[0].timestamp : 0;
          const timestampB = b.messages.length > 0 ? b.messages[0].timestamp : 0;
          return timestampB - timestampA;
        });
        res.status(200).json(conversations);
    }catch(e){
        next(e);
    }
}
module.exports.create_or_fetch_private_conversation = async (req, res, next) => {
    try{
        const receiverUserId = req.body.receiverUserId.trim(); // The ID of the user selected for conversation
        const ConversationisExist = await Conversation.findOne({
            type: 'private',
            participants: { $all: [req.user.id, receiverUserId] },
        }).populate({path: 'messages', populate: { path:'sender', select: '-password' }})
        if(ConversationisExist) {
            // set unreadMessage by current user to zero after fetch conversation
            ConversationisExist.unreadCount[req.user.id] = 0;
            ConversationisExist.markModified('unreadCount'); // Mark the field as modified
            await ConversationisExist.save();
            return res.send(ConversationisExist);
        }
        const newConversation = await new Conversation({
            type: 'private',
            participants: [req.user.id, receiverUserId],
            unreadCount: { [req.user.id]: 0, [receiverUserId]: 0 }, // Initialize unread counts
        }).save()
        res.status(200).json(newConversation)
    }catch(e){
        next(e);
    }
}
module.exports.fetchConversation = async (req, res, next) => {
    try{
        const {id} = req.params
        let conversationID;
        try {
            conversationID = new mongoose.Types.ObjectId(id);
        } catch (error) {
            throw new HandleError(`Invalid id conversation`, 400);
        }
        const conversation = await Conversation.findOne({_id:conversationID , participants: { $in: [req.user.id] }})
        .populate({path: 'messages', populate: { path:'sender', select: ['first_name', 'last_name', 'avatar']}})
        .populate({path: 'participants', select: ['-updatedAt', '-password', '-isVerified']})
        .exec()
        conversation.unreadCount[req.user.id] = 0;
        conversation.markModified('unreadCount'); // Mark the field as modified
        await conversation.save();
        if(!conversation) throw new HandleError(`Conversation not found`, 404)
        res.status(200).send(conversation)
    }catch(e){
        next(e);
    }
}
module.exports.sendMessage = async (req, res, next) => {
    try{
        const io = req.app.get('socketio');
        const conversationID = req.params.conversationID
        const conversation = await Conversation.findOne({
            _id: conversationID,
            participants: { $in: [req.user.id] },
        })
        if(!conversation) throw new HandleError(`Conversation not found`, 404)
        const originalContent = req.body.content.trim();
        const contentWithPlaceholder = originalContent.replace(/\n/g, '@@LINE_BREAK@@');
        const EncryptedContent = CryptoJS.AES.encrypt(contentWithPlaceholder, process.env.CRYPTO_KEY);
        const newMessage = await new Message({
            sender: req.user.id,
            content: EncryptedContent,
        }).save()
        // Update unreadCount for all conversation participants except the sender
        conversation.participants.forEach((participant) => {
        if (participant.toString() !== req.user.id.toString()) {
          conversation.unreadCount[participant] = (conversation.unreadCount[participant] || 0) + 1;
        }
        });
        conversation.unreadCount[req.user.id] = 0;
        conversation.markModified('unreadCount'); // Mark the field as modified
        await newMessage.populate({ path:'sender', select: ['first_name', 'last_name', 'avatar']})
        conversation.messages.push(newMessage);
        await conversation.save();
        io.emit('new_message', { convID: conversationID, newMessage});

        res.status(200).json(newMessage);
    }catch(e){
        next(e);
    }
}