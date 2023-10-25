const express = require('express')
const router = express.Router({mergeParams: true})
const { searchForUsers, fetchUserDataProfile, fetchCurrentUser, checkAuth } = require('../controllers/user.controller')
const { authMiddleware, isAdmin } = require('../middleware')

router.get('/currentUser', authMiddleware, fetchCurrentUser)
router.post('/search', searchForUsers)
router.get('/:id', fetchUserDataProfile)

module.exports = router