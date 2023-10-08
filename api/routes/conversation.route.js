const express = require('express')
const { Create_Group_Conversation, create_or_fetch_private_conversation, sendMessage, Conversation_List } = require('../controllers/conversation.controller')
const router = express.Router({mergeParams: true})

router.post('/create-group', Create_Group_Conversation)
router.post('/create-or-fetch-private-conversation', create_or_fetch_private_conversation)
router.post('/:conversationID/send-message', sendMessage)
router.get('/conversations', Conversation_List)

module.exports = router