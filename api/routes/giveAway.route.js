const express = require('express')
const { NewGiveAway, fetchGiveAways, gamesHaveAvailabeGiveaway } = require('../controllers/giveAway.controller')
const router = express.Router({mergeParams: true})
const { authMiddleware, isAdmin } = require('../middleware')

router.post('/', authMiddleware, isAdmin, NewGiveAway)
router.get('/', fetchGiveAways)
router.get('/availabe-giveaway-games', gamesHaveAvailabeGiveaway)

module.exports = router