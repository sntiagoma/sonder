'use strict';
var express = require('express');
var controller = require('./lists.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

// /movie/like/admin
router.put('/:type/:state/:username/:artist/:track', auth.isAuthenticated(), controller.ctrl);
router.put('/:type/:state/:username/:id', auth.isAuthenticated(), controller.ctrl);

module.exports = router;
