'use strict';

var _  = require('lodash');
var Promise = require("bluebird");
var request = require("request");
var Log = require('log'), log = new Log('info');
var Trakt = require("trakt-api"), trakt = Trakt(process.env.TRAKT_ID);

exports.index = function(req, res) {
  trakt.movieTrending({extended:"images"})
  .then((trendMovies)=>{
    trakt.moviePopular({extended:"images"})
    .then((popularMovies)=>{
      res.json(
        _.union(
          _.map(trendMovies,(trendMovie)=>{return trendMovie.movie}),
          popularMovies
        )
      );
    })
    .catch((error)=>{
      throw ("It Fail in popular"+error);
    })
  }
  ).catch((error) => {
    log.error("On API /movies, ERROR: %s", error);
    res.send(error);
  });
};