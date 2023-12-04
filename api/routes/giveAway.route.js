const express = require('express')
const { NewGiveAway } = require('../controllers/giveAway.controller')
const router = express.Router({mergeParams: true})
const { authMiddleware, isAdmin } = require('../middleware')

router.post('/', authMiddleware, isAdmin, NewGiveAway)

module.exports = router