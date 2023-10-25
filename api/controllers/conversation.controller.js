const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const CryptoJS = require('crypto-js');
const HandleError = require('../utils/HandleError');
const mongoose = require('mongoose');
const User = require('../models/user.model');

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
        await newGroupConversation.populate({path: 'admins', select: ['first_name', 'last_name']})
        newGroupConversation.save();
        res.status(200).send({
            group_id: newGroupConversation._id,
            first_creator_name: newGroupConversation.admins[0].first_name,
            last_creator_name: newGroupConversation.admins[0].last_name
            
        });
    } catch (e) {
        next(e);
    }
}

module.exports.addUserToGroup = async (req, res, next) => {
    try{
        const {userId, groupId} = req.params;
        const userIds = userId.split(','); // Convert to an array of user IDs
        
        // track the user IDs that were added to the group or already in the group
        const users = [];
        const usersAlreadyInGroup = [];
        
        if(!mongoose.Types.ObjectId.isValid(groupId)) throw new HandleError(`Invalid group id`, 400);
        const group = await Conversation.findOne({ type: 'group', _id: groupId })
        if(!group) throw new HandleError(`Group not found`, 404);
        const AdminAdded = await User.findById(req.user.id).select(['first_name', 'last_name']);
        if (!group.admins.includes(AdminAdded._id)) throw new HandleError(`Only admins can add users to the group`, 403);
        // Validate each user ID
        // add them to the group
        await Promise.all(
            userIds.map(async (userId) => {
                if (!mongoose.Types.ObjectId.isValid(userId)) throw new HandleError(`Invalid user id: ${userId}`, 400);
                const user = await User.findById(userId).select(['-updatedAt', '-password', '-isVerified']);
                if (!user) throw new HandleError(`User not found for id: ${userId}`, 404);
                if (group.participants.includes(user._id)) {
                    usersAlreadyInGroup.push(`${user.first_name} ${user.last_name}`);
                }else{
                    users.push(user);
                }
            })
        );
        // throw error if user is already in group
        if(usersAlreadyInGroup.length > 0) throw new HandleError(`${usersAlreadyInGroup.join(', ')} - already in the group`, 409);
        // add users to the group
        for (const userId of users){
            group.participants.push(userId);
        }
        await group.save();
        const fullNames = users.map(user => `${user.first_name} ${user.last_name}`);
        res.status(200).send({
            groupID: group._id,
            message: `${AdminAdded.first_name} ${AdminAdded.last_name} Added ${fullNames.join(', ')} to the group`,
            AddedUsers: users
        });
    }catch (e) {
       next(e);
    }
}
module.exports.removeUserFromGroup = async (req, res, next) => {
    try{
        const {userId, groupId} = req.params;
        // check id validity
        if (!mongoose.Types.ObjectId.isValid(groupId)) throw new HandleError(`Invalid group id`, 400);
        if (!mongoose.Types.ObjectId.isValid(userId)) throw new HandleError(`Invalid user id`, 400);
        const [user, group] = await Promise.all([
            User.findById(userId),
            Conversation.findOne({ type: 'group', _id: groupId })
        ])
        if(!group) throw new HandleError(`Group not found`, 404);
        // only admins are allowed to remove users from the group
        const admin = await User.findById(req.user.id).select(['first_name', 'last_name']);
        if (!group.admins.includes(admin._id)) throw new HandleError(`Only admins can delete users from the group`, 403);
        if(!user) throw new HandleError(`User not found`, 404);
        if(req.user.id == user._id) throw new HandleError(`You cannot delete yourself from the group`, 403);
        if(!group.participants.includes(user._id)) throw new HandleError(`User is not in the group`, 404);
        // remove user from the group
        group.participants = group.participants.filter(participantID => participantID.toString() !== user._id.toString());
        await group.save();
        res.status(200).send({groupID: group._id, message: `${admin.first_name} ${admin.last_name} deleted ${user.first_name} ${user.last_name} from the group`});
    }catch (e) {
        next(e);
    }
}
// Search for users (not members in the group) to add to the group
module.exports.searchToAdd = async (req, res, next) => {
    try{
        const {groupId} = req.params
        const {q} = req.query
        if(q.length < 1) return 0;
        // check id validity
        if (!mongoose.Types.ObjectId.isValid(groupId)) throw new HandleError(`Invalid group id`, 400);
        const group = await Conversation.findOne({ _id: groupId, type: 'group' })
        if(!group) throw new HandleError(`Group not found` , 404);
        const users = await User.find({
            _id: {
                $nin: group.participants,
              },
            $or: [
              {
                $expr: {
                  $regexMatch: {
                    input: {
                      $concat: ["$first_name", " ", "$last_name"]
                    },
                    regex: new RegExp(q, "i")
                  }
                }
              }
            ]
          }).select(['_id', 'avatar', 'first_name', 'last_name', 'email']);
        res.status(200).json(users)
    }catch(e){
        console.log(e);
        next(e)
    }
}
module.exports.deleteGroup = async (req, res, next) => {
    try {
        const {groupId} = req.params;
        if (!mongoose.Types.ObjectId.isValid(groupId)) throw new HandleError(`Invalid group id`, 400);
        const group = await Conversation.findOneAndDelete({ type: 'group', _id: groupId });
        if (!group) throw new HandleError(`Group not found`, 404);
        if (!group.admins.includes(req.user.id)) throw new HandleError(`Only admins can delete the group`, 403);
        await Message.deleteMany({ _id: { $in: group.messages } });
        res.status(200).json({success: true, message: "Group deleted successfully"})
    }catch(e){
        next(e);
    }
}
module.exports.leaveGroup = async (req, res, next) => {
    try {
        const io = req.app.get('socketio');
        const {groupId} = req.params;
        if (!mongoose.Types.ObjectId.isValid(groupId)) throw new HandleError(`Invalid group id`, 400);
        const group = await Conversation.findOne({ type: 'group', _id: groupId });

        if (!group) throw new HandleError(`Group not found`, 404);
        const user = await User.findById(req.user.id);
        if(group.admins.includes(user._id)) throw new HandleError(`Admin can only delete the group, not left`, 404);
        if(!group.participants.includes(user._id)) throw new HandleError(`You are already not in the group`, 404);
        // remove user from the group
        group.participants = group.participants.filter(participantID => participantID.toString() !== user._id.toString());
        await group.save();
        // SEND ALERT MESSAGE
        const EncryptedContent = CryptoJS.AES.encrypt(`${user.first_name} ${user.last_name} left the group`, process.env.CRYPTO_KEY);
        const alertedMessage = await new Message({
            sender: req.user.id,
            content: EncryptedContent,
            isFromSystem: true
        }).save()
        io.emit('new_message', { convID: groupId, newMessage: alertedMessage});
        res.status(200).send({success: true})
    }catch(e){
        next(e);
    }
}
// get group participants
module.exports.fetchGroupParticipants = async (req, res, next) => {
    try{
        const {id} = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`Invalid conversation id `, 400);

        const group = await Conversation.findOne({ _id: id, type: 'group' })
        .selected('participants')
        .populate({path: 'participants', select: ['-updatedAt', '-password', '-isVerified']})
        .exec()
        if(!group) throw new HandleError(`Conversation not found`, 404)
    }catch(e){
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
        const {receiverUserId} = req.body; // The ID of the user selected for conversation
        if (!mongoose.Types.ObjectId.isValid(receiverUserId)) throw new HandleError(`Invalid receiver user id `, 400);
        if(req.user.id === receiverUserId) throw new Error(`You cannot create a conversation with your self`, 400);
        const ConversationisExist = await Conversation.findOne({
            type: 'private',
            participants: { $all: [req.user.id, receiverUserId] },
        })
        if(ConversationisExist) {
            return res.status(200).send(ConversationisExist._id);
        }
        const newConversation = await new Conversation({
            type: 'private',
            participants: [req.user.id, receiverUserId],
            unreadCount: { [req.user.id]: 0, [receiverUserId]: 0 }, // Initialize unread counts
        }).save()
        res.status(200).send(newConversation._id)
    }catch(e){
        next(e);
    }
}
module.exports.fetchConversation = async (req, res, next) => {
    try{
        const {id} = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`Invalid conversation id `, 400);

        const conversation = await Conversation.findOne({_id:id , participants: { $in: [req.user.id] }})
        .populate({path: 'messages', populate: { path:'sender', select: ['first_name', 'last_name', 'avatar']}})
        .populate({path: 'participants', select: ['-updatedAt', '-password', '-isVerified']})
        .exec()
        if(!conversation) throw new HandleError(`Conversation not found`, 404)
        conversation.unreadCount[req.user.id] = 0;
        conversation.markModified('unreadCount'); // Mark the field as modified
        await conversation.save();
        res.status(200).send(conversation)
    }catch(e){
        next(e);
    }
}
module.exports.sendMessage = async (req, res, next) => {
    try{
        const io = req.app.get('socketio');
        const conversationID = req.params.conversationID
        if (!mongoose.Types.ObjectId.isValid(conversationID)) throw new HandleError(`Invalid conversation id `, 400);

        const isFromSystem = req.body.isFromSystem || false
        const conversation = await Conversation.findOne({
            _id: conversationID,
            participants: { $in: [req.user.id] },
        })
        if(!conversation) throw new HandleError(`Conversation not found`, 404)
        if(!conversation.participants.includes(req.user.id)) throw new HandleError(`You are not participant in this conversation`, 403)
        const originalContent = req.body.content.trim();
        const contentWithPlaceholder = originalContent.replace(/\n/g, '@@LINE_BREAK@@');
        const EncryptedContent = CryptoJS.AES.encrypt(contentWithPlaceholder, process.env.CRYPTO_KEY);
        const newMessage = await new Message({
            sender: req.user.id,
            content: EncryptedContent,
            isFromSystem
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