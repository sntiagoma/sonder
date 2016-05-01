'use strict';

var _  = require('lodash');
var Promise = require("bluebird");
var request = require("request");
var Log = require('log'), log = new Log('info');
var Trakt = require("trakt-api"), trakt = Trakt(process.env.TRAKT_ID);
var Movie = require("./movie.model");
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
  .then((movie)=>{
    Movie.findOne(
      {
        slug:query
      },
      function(err,show){
        if(err){
          let newMovie = new Movie({
            slug: query
          });
          newMovie.save((err,show)=>{
            if(err){
              log.error(err);
            }else{
              log.info("Movie %s have been added to the DB",show.getId());
            }
          });
        }else{
          if(show == null){
            let newMovie = new Movie({
              slug: query
            });
            newMovie.save((err,show)=>{
              if(err){
                log.error(err);
              }else{
                log.info("Movie %s added to the DB",show.getId());
              }
            });
          }else{
            log.info("Movie %s already existis",show.getId());
          }
        }
      }
    );
    trakt.moviePeople(query, {extended:"full,images"})
    .then((people)=>{
      movie.people = people;
      res.json(movie);
    })
    .catch((error)=>{
      throw "Error on People: "+error;
    });
  })
  .catch((err)=>{
    res.status(404).json({error:err});
  });
}
