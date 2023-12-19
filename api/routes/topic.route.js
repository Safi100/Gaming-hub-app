const express = require('express');

const { newTopic, deleteTopic, fetchTopic, newComment, deleteComment, updateTopic} = require('../controllers/topic.controller');
const router = express.Router({mergeParams: true});
const { authMiddleware, isAdmin } = require('../middleware');

router.get('/:id', fetchTopic)
router.put('/:id', authMiddleware, updateTopic) // protected route
router.post('/:gameID', authMiddleware, newTopic) // protected route
router.delete('/:topicID', authMiddleware, deleteTopic) // protected route
router.post('/:topicID/comment', authMiddleware, newComment) // protected route
router.delete('/:topicID/:commentID', authMiddleware, deleteComment) // protected route

module.exports = router