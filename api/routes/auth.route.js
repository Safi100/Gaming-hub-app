const express = require('express')
const { Register, Login, forgotPassword, resetPassword, verifyEmail } = require('../controllers/auth.controller')
const router = express.Router({mergeParams: true})

router.post('/register', Register)
router.post('/login', Login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:id/:token', resetPassword)
router.post('/verify-email/:id/:token', verifyEmail)

module.exports = router