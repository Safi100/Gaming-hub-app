const express = require('express')
const { createGame, fetchAllGames, fetchGameToEdit, updateGame} = require('../controllers/game.controller')
const router = express.Router({mergeParams: true})
const { authMiddleware, isAdmin } = require('../middleware')
const multer = require('multer')
const { storage } = require('../utils/cloudinary')
const upload = multer({storage})

router.get('/', fetchAllGames)
router.post('/', authMiddleware, isAdmin, upload.fields([{ name: 'mainPhoto', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), createGame)
router.put('/:id', authMiddleware, isAdmin, upload.fields([{ name: 'mainPhoto', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), updateGame)
router.get('/fetch-game-to-edit/:id', authMiddleware, isAdmin, fetchGameToEdit)

module.exports = router