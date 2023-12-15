const express = require('express');

const { newTopic, deleteTopic } = require('../controllers/topic.controller');
const router = express.Router({mergeParams: true});
const { authMiddleware, isAdmin } = require('../middleware');

router.post('/:gameID', authMiddleware, newTopic)
router.delete('/:topicID', authMiddleware, deleteTopic)

module.exports = router