'use strict';
var express = require('express');
var controller = require('./recommender.controller');
var router = express.Router();

router.get('/:username', controller.index);
module.exports = router;
