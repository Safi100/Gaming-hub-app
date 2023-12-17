const express = require('express');

const { newTopic, deleteTopic, fetchTopic, newComment } = require('../controllers/topic.controller');
const router = express.Router({mergeParams: true});
const { authMiddleware, isAdmin } = require('../middleware');

router.get('/:id', fetchTopic)
router.post('/:gameID', authMiddleware, newTopic) // protected route
router.delete('/:topicID', authMiddleware, deleteTopic) // protected route
router.post('/:topicID/comment', authMiddleware, newComment) // protected route

module.exports = router