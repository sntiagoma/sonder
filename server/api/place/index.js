'use strict';

var express = require('express');
var controller = require('./place.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/search/:query', controller.search);
//SEARCH
router.get('/:venueid', controller.venue);
module.exports = router;
