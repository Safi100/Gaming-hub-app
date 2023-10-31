const express = require('express')
const router = express.Router({mergeParams: true})
const { searchForUsers, fetchUserDataProfile, fetchCurrentUser, followUser } = require('../controllers/user.controller')
const { authMiddleware, isAdmin } = require('../middleware')

router.get('/currentUser', authMiddleware, fetchCurrentUser)
router.post('/search', searchForUsers)
router.get('/profile/:id', fetchUserDataProfile)
router.post('/follow-user/:id', authMiddleware, followUser)

module.exports = router