const express = require('express')
const { createGame, fetchGamesToControl, fetchGameToEdit, updateGame, 
    toggle_favorite_game, fetchGameProfile, fetchGamesID, deleteGame} = require('../controllers/game.controller')
const router = express.Router({mergeParams: true})
const { authMiddleware, isAdmin } = require('../middleware')
const multer = require('multer')
const { storage } = require('../utils/cloudinary')
const upload = multer({storage})

router.get('/fetch-games-category', authMiddleware, isAdmin, fetchGamesID) // admin routes
router.get('/fetch-games-to-control', authMiddleware, isAdmin, fetchGamesToControl) // admin route
router.get('/:id', fetchGameProfile)
router.post('/', authMiddleware, isAdmin, upload.fields([{ name: 'mainPhoto', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), createGame) // admin route
router.put('/:id', authMiddleware, isAdmin, upload.fields([{ name: 'mainPhoto', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), updateGame) // admin route
router.delete('/:id', authMiddleware, isAdmin, deleteGame) // admin route
router.get('/fetch-game-to-edit/:id', authMiddleware, isAdmin, fetchGameToEdit) // admin route
router.post('/add-to-favorite/:id', authMiddleware, toggle_favorite_game)

module.exports = router