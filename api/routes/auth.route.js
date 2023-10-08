const express = require('express')
const { Register, Login, forgotPassword, resetPassword, verifyEmail, Logout } = require('../controllers/auth.controller')
const router = express.Router({mergeParams: true})
const { authMiddleware } = require('../middleware')

router.post('/register', Register)
router.post('/login', Login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:id/:token', resetPassword)
router.post('/verify-email/:id/:token', verifyEmail)
router.post('/logout', authMiddleware, Logout)

module.exports = router