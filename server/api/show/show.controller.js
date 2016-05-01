'use strict';

var _  = require('lodash');
var Promise = require("bluebird");
var request = require("request");
var Log = require('log'), log = new Log('info');
var Trakt = require("trakt-api"), trakt = Trakt(process.env.TRAKT_ID);
var Show = require("./show.model");

/**
 * Add Show to DB from Trakt API Object
 * @param {Object} apiShow - Trakt API Object
 * @return {Promise<Show,Error>}
 */
function addShowToDB(apiShow) {
  return new Promise(
    function (resolve, reject) {
      let newShow = new Show({
        slug: apiShow.ids.slug
      });
      newShow.save((err,show)=>{
        if(err){
          log.error(err);
          reject(err);
        }else{
          log.info("Show %s have been added to the DB",show.getId());
          resolve(show);
        }
      });
      resolve(newShow);
    }
  );
}

/**
 * Method to get a Show and make it if it hadn't made it before.
 * @param {Object} apiShow - Trakt API Object
 * @return {Promise<Show,Error>}
 */
function checkShow(apiShow) {
  return new Promise(
    function (resolve, reject) {
      Show.findOne(
        {
          slug:apiShow.ids.slug
        },
        function(err,show){
          if(err){
            addShowToDB(apiShow).then(
              (dbShow)=>{
                resolve(dbShow);
                return null;
              }
            ).catch((err)=>{reject(err);});
          }else{
            if(show == null){
              addShowToDB(apiShow).then(
                (dbShow)=>{
                  resolve(dbShow);
                  return null;
                }
              ).catch((err)=>{reject(err);});
            }else{
              log.info("Show %s already exists",show.getId());
              resolve(show);
            }
          }
        }
      );
    }
  );
}

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
      //Saving to DB
      checkShow(show)
        .then((dbShow)=>{
          //Adding Extra-Info
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
          return null;
        });
    })
  .catch((err)=>{
    res.status(404).json({error:err});
  });
};
