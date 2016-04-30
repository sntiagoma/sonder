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

exports.search = function(req, res) {
  var query = req.params.query;
  trakt.searchMovie(query)
  .then((result)=>{
    res.json(_.map(result,(item)=>{return item.movie}));
  })
  .catch((error)=>{
    log.error("On API /movies, ERROR: %s", error);
    res.send(error);
  });
};

exports.movie = function(req, res){
  var query = req.params.traktSlug;
  trakt.movie(query, {extended:"full,images"})
  .then((show)=>{
    trakt.moviePeople(query, {extended:"full,images"})
    .then((people)=>{
      show.people = people;
      res.json(show);
    })
    .catch((error)=>{
      throw "Error on People: "+error;
    });
  })
  .catch((err)=>{
    res.status(404).json({error:err});
  });
}