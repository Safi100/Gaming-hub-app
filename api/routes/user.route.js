const express = require('express')
const router = express.Router({mergeParams: true})
const { searchForUsers, fetchUserDataProfile, fetchCurrentUser,
    follow_unfollow_user, editUserDataProfile, removeProfilePicture,
    changePassword } = require('../controllers/user.controller')
const { authMiddleware, isAdmin } = require('../middleware')
const multer = require('multer')
const { storage } = require('../utils/cloudinary')
const upload = multer({storage})

router.get('/currentUser', authMiddleware, fetchCurrentUser)
router.post('/search', searchForUsers)
router.delete('/remove-profile-picture', authMiddleware, removeProfilePicture)
router.put('/edit-profile', authMiddleware, upload.single('avatar'), editUserDataProfile)
router.put('/change-password', authMiddleware, changePassword)
router.get('/profile/:id', fetchUserDataProfile)
router.post('/toggle-following-user/:id', authMiddleware, follow_unfollow_user)

module.exports = router