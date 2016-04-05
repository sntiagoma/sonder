'use strict';

var express = require('express');
var controller = require('./music.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/search/:query', controller.search);
router.get('/:artist', controller.artist);
router.get('/:artist/tracks/:track', controller.track);
module.exports = router;
