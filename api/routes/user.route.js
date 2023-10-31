const express = require('express')
const router = express.Router({mergeParams: true})
const { searchForUsers, fetchUserDataProfile, fetchCurrentUser, follow_unfollow_user } = require('../controllers/user.controller')
const { authMiddleware, isAdmin } = require('../middleware')

router.get('/currentUser', authMiddleware, fetchCurrentUser)
router.post('/search', searchForUsers)
router.get('/profile/:id', fetchUserDataProfile)
router.post('/toggle-following-user/:id', authMiddleware, follow_unfollow_user)

module.exports = router