'use strict';

var express = require('express');
var controller = require('./show.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/search/:query', controller.search);
router.get('/:traktSlug', controller.show);
module.exports = router;
