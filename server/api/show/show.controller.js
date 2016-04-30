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

exports.search = function(req, res) {
  var query = req.params.query;
  trakt.searchShow(query)
  .then((result)=>{
    res.json(_.map(result,(item)=>{return item.show;}));
  })
  .catch((error)=>{
    log.error("On API /movies, ERROR: %s", error);
    res.send(error);
  });
};

exports.show = function(req, res){
  var query = req.params.traktSlug;
  trakt.show(query, {extended:"full,images"})
  .then(
    (show)=>{
      trakt.showSeasons(query,{extended:"full,images"})
      .then((seasons)=>{
        trakt.showPeople(query, {extended:"full,images"}).
        then((people)=>{
          show.seasons = seasons;
          show.people = people;
          res.json(show);
        })
        .catch(
          (err)=>{
            throw "Error on People: "+err
          });
      })
      .catch(
        (err)=>{throw "Error on Seasons: "+err;}
      );
    })
  .catch((err)=>{
    res.status(404).json({error:err});
  });
};