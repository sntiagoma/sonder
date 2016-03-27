'use strict';

var _  = require('lodash');
var Promise = require("bluebird");
var request = require("request");
var Log = require('log'), log = new Log('info');
var Trakt = require("trakt-api"), trakt = Trakt(process.env.TRAKT_ID);

exports.index = function(req, res) {
  trakt.showTrending({extended:"images"})
  .then((trendShows)=>{
    trakt.showPopular({extended:"images"})
    .then((popularShows)=>{
      res.json(
        _.union(
          _.map(trendShows,(trendShow)=>{return trendShow.show}),
          popularShows
        )
      );
    })
    .catch((error)=>{
      throw ("It Fail in popular"+error);
    })
  }
  ).catch((error) => {
    log.error("On API /shows, ERROR: %s", error);
    res.send(error);
  });
};