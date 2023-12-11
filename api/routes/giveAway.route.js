const express = require('express');

const { NewGiveAway, fetchGiveAways, gamesHaveAvailabeGiveaway, 
    joinGiveaway, giveawayProfile, editGiveaway, deleteGiveaway, myGiveaways } = require('../controllers/giveAway.controller');
const router = express.Router({mergeParams: true});
const { authMiddleware, isAdmin } = require('../middleware');

router.post('/', authMiddleware, isAdmin, NewGiveAway); // protected
router.get('/', fetchGiveAways);
router.get('/my-giveaway', authMiddleware ,myGiveaways); // protected
router.get('/availabe-giveaway-games', gamesHaveAvailabeGiveaway);
router.put('/:id', authMiddleware, isAdmin, editGiveaway); // protected
router.delete('/:id', authMiddleware, isAdmin, deleteGiveaway); // protected
router.get('/:id', giveawayProfile);
router.post('/join/:id', authMiddleware, joinGiveaway); // protected

module.exports = router