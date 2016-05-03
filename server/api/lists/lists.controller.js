'use strict';
var Promise = require("bluebird");

var Movie = require("../movie/movie.model");
var Show  = require("../show/show.model");
var Track = require("../music/track.model");
var Book  = require("../book/book.model");
var Place = require("../place/place.model");
var User  = require("../user/user.model");

var checkNull = function (dbObject) {
  if(dbObject == null){
    var NullError = new Error();
    NullError.message = "Null dbObject";
    NullError.stack = "stack";
    return NullError;
  }else{
    return dbObject;
  }
};

var parseDb = function (word) {
  switch (word) {
    case "like":
      return "liked";
    case "later":
      return "later";
    case "dislike":
      return "disliked";
    case "movie":
      return "movies";
    case "show":
      return "shows";
    case "track":
      return "tracks";
    case "book":
      return "books";
    case "place":
      return "places";
  }
};

var getItem = function (type, id) {
  return new Promise(
    function (resolve, reject) {
      switch (type) {
        case "movie":
          Movie.findOne({slug: id}, function (err, movie) {
            if (err) {
              reject(err);
            } else {
              if (movie == null) {
                reject(checkNull(movie));
              } else {
                resolve(movie);
              }
            }
          });
          break;
        case "show":
          Show.findOne({slug: id}, function (err, show) {
            if(err){
              reject(err);
            } else {
              if (show == null){
                reject(checkNull(show));
              } else {
                resolve(show);
              }
            }
          });
          break;
        case "track":
          Track.findOne({slug:{artist: id.artist, track: id.track}}, function (err, track) {
            if(err){
              reject(err);
            } else {
              if (track == null){
                reject(checkNull(track));
              } else {
                resolve(track);
              }
            }
          });
          break;
        case "book":
          Book.findOne({slug: id}, function (err, book) {
            if(err){
              reject(err);
            } else {
              if (book == null){
                reject(checkNull(book));
              } else {
                resolve(book);
              }
            }
          });
          break;
        case "place":
          Place.findOne({slug: id}, function (err, place) {
            if(err){
              reject(err);
            } else {
              if (place == null){
                reject(checkNull(place));
              } else {
                resolve(place);
              }
            }
          });
          break;
        default:
          reject(checkNull(null));
          break;
      }
    }
  );
};

var getUser = function (username) {
  return new Promise(
    function (resolve, reject) {
      User.findOne({username:username},
        function (err, user) {
          if(err){
            reject(err);
          }else{
            if(user==null){
              reject(checkNull(user));
            }else{
              resolve(user);
            }
          }
        }
      );
    }
  );
};

exports.ctrl = function(req, res) {
  var type     = req.params.type;
  var state    = req.params.state;
  var username = req.params.username;
  var id       = req.params.id;
  var artist   = req.params.artist;
  var track    = req.params.track;
  getUser(username)
    .then((dbUser)=>{
      let contentId;
      if(type=="track"){
        contentId = {artist:artist, track:track};
      }else{
        contentId = id;
      }
      getItem(type, contentId)
        .then((dbContent)=>{
          dbUser[parseDb(type)]["liked"].pull({_id:dbContent._id});
          dbUser[parseDb(type)]["later"].pull({_id:dbContent._id});
          dbUser[parseDb(type)]["disliked"].pull({_id:dbContent._id});
          dbUser[parseDb(type)][parseDb(state)].push(dbContent);
          dbUser.save(function (err) {
            return err;
          });
          res.send();
          return null; //avoid warning
        });
      return null;
    })
    .catch((err)=>{
      res.status(400).send(err);
    });
};
