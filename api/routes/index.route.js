const express = require('express');

const { generalSearch, homePageData } = require('../controllers/index.controller');
const router = express.Router({mergeParams: true});

router.get('/', homePageData)
router.post('/search', generalSearch)

module.exports = router