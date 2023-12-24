const express = require('express')
const router = express.Router({mergeParams: true})
const { searchForUsers, fetchUserDataProfile, fetchCurrentUser,
    follow_unfollow_user, editUserDataProfile, removeProfilePicture,
    changePassword, clearNotifications, banUser, bannedUsers, removeBan } = require('../controllers/user.controller')
const { authMiddleware, isAdmin } = require('../middleware')
const multer = require('multer')
const { storage } = require('../utils/cloudinary')
const upload = multer({storage})

router.get('/currentUser', authMiddleware, fetchCurrentUser) // protected
router.get('/banned-users', authMiddleware, isAdmin, bannedUsers)
router.post('/search', searchForUsers)
router.delete('/clear-notifications', authMiddleware, clearNotifications) // protected
router.delete('/remove-profile-picture', authMiddleware, removeProfilePicture) // protected
router.put('/edit-profile', authMiddleware, upload.single('avatar'), editUserDataProfile) // protected
router.put('/change-password', authMiddleware, changePassword) // protected
router.post('/ban-user/:id', authMiddleware, isAdmin, banUser) // protected, admin route
router.delete('/ban-user/:id', authMiddleware, isAdmin, removeBan) // protected, admin route
router.get('/profile/:id', fetchUserDataProfile)
router.post('/toggle-following-user/:id', authMiddleware, follow_unfollow_user) // protected

module.exports = router