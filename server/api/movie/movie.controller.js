'use strict';

var _  = require('lodash');
var Promise = require("bluebird");
var request = require("request");
var Log = require('log'), log = new Log('info');
var Trakt = require("trakt-api"), trakt = Trakt(process.env.TRAKT_ID);
var Movie = require("./movie.model");

/**
 * Add Movie to DB from Trakt API Object
 * @param {Object} apiMovie - Trakt API Object
 * @return {Promise<Movie,Error>}
 */
function addMovieToDB(apiMovie) {
  return new Promise(
    function (resolve, reject) {
      let newMovie = new Movie({
        slug: apiMovie.ids.slug
      });
      newMovie.save((err,movie)=>{
        if(err){
          log.error(err);
          reject(err);
        }else{
          log.info("Movie %s have been added to the DB",movie.getId());
          resolve(movie);
        }
      });
      resolve(newMovie);
    }
  );
}

/**
 * Method to get a Movie and make it if it hadn't made it before.
 * @param {Object} apiMovie - Trakt API Object
 * @return {Promise<Movie,Error>}
 */
function checkMovie(apiMovie) {
  return new Promise(
    function (resolve, reject) {
      Movie.findOne(
        {
          slug:apiMovie.ids.slug
        },
        function(err,movie){
          if(err){
            addMovieToDB(apiMovie).then(
              (dbMovie)=>{
                resolve(dbMovie);
                return null;
              }
            ).catch((err)=>{reject(err);});
          }else{
            if(movie == null){
              addMovieToDB(apiMovie).then(
                (dbMovie)=>{
                  resolve(dbMovie);
                  return null;
                }
              ).catch((err)=>{reject(err);});
            }else{
              log.info("Movie %s already exists",movie.getId());
              resolve(movie);
            }
          }
        }
      );
    }
  );
}

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
    checkMovie(movie)
      .then((dbMovie)=>{
        trakt.moviePeople(query, {extended:"full,images"})
          .then((people)=>{
            movie.people = people;
            res.json(movie);
            return null;
          })
          .catch((error)=>{
            throw "Error on People: "+error;
          });
        return null;
      })
  })
  .catch((err)=>{
    res.status(404).json({error:err});
  });
};
