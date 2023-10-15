const express = require('express')
const { Create_Group_Conversation, create_or_fetch_private_conversation, sendMessage, Conversation_List, fetchConversation, searchUsersForConversation } = require('../controllers/conversation.controller')
const router = express.Router({mergeParams: true})

router.post('/create-group', Create_Group_Conversation)
router.post('/create-or-fetch-private-conversation', create_or_fetch_private_conversation)
router.get('/conversation-list', Conversation_List)
router.get('/:id', fetchConversation)
router.post('/:conversationID/send-message', sendMessage)

module.exports = router