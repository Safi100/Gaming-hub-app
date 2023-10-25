const express = require('express')
const { Create_Group_Conversation, create_or_fetch_private_conversation, sendMessage, Conversation_List,
     fetchConversation, addUserToGroup, removeUserFromGroup, searchToAdd, deleteGroup, leaveGroup } = require('../controllers/conversation.controller')
const { searchForUsers } = require('../controllers/user.controller');
const router = express.Router({mergeParams: true})

router.post('/create-group', Create_Group_Conversation)
router.post('/create-or-fetch-private-conversation', create_or_fetch_private_conversation)
router.get('/conversation-list', Conversation_List)
router.post('/search-users-to-chat', searchForUsers)
router.get('/:id', fetchConversation)
router.post('/:conversationID/send-message', sendMessage)
router.post('/:groupId/leave-group', leaveGroup)
router.delete('/:groupId/delete-group', deleteGroup)
router.post('/:groupId/search-users-to-add', searchToAdd)
router.post('/:groupId/add-user-to-group/:userId', addUserToGroup)
router.delete('/:groupId/remove-user-from-group/:userId', removeUserFromGroup)

module.exports = router