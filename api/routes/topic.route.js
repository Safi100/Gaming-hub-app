const express = require('express');

const { newTopic } = require('../controllers/topic.controller');
const router = express.Router({mergeParams: true});
const { authMiddleware, isAdmin } = require('../middleware');

router.post('/:gameID', authMiddleware, newTopic)

module.exports = router