'use strict';

var express = require('express');
var controller = require('./movie.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/search/:query', controller.search);
module.exports = router;
