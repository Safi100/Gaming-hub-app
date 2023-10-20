const express = require('express')
const { searchForUsers } = require('../controllers/user.controller')
const router = express.Router({mergeParams: true})

router.post('/search', searchForUsers)


module.exports = router