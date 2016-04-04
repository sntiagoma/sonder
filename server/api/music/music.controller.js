'use strict';

var _         = require('lodash');
var Promise   = require("bluebird");
var request   = require("request");
var Log       = require('log'), log = new Log('info');
var lastfmapi = require('lastfmapi');
var lfm       = new lastfmapi({
  'api_key': process.env.LASTFM_ID,
  'api_secret': process.env.LASTFM_SECRET
});


function asyncGetTopTracks(){
  return new Promise(function(resolve,reject){
    lfm.geo.getTopTracks(
      {
        'country': 'Colombia',
        'limit': 20
      },
      function(err, data){
        if(err){
          reject(err);
        }
        resolve(data.track);
      }
    );
  });
};

function asyncSearchForTracks(query){
  return new Promise(function(resolve,reject){
    lfm.track.search(
      {
        'track': query
      },
      function(err, data){
        if(err){
          reject(err);
        }
        resolve(data.trackmatches.track);
      }
    );
  });
};

function getTrack(artist, track){
  return new Promise(
    function(resolve, reject){
      lfm.track.getInfo(
        {track: track, artist: artist},
        function(err, data){
          if(err){
            reject(err);
          }
          resolve(data);
        });
    }
  );
};

function getArtist(artist){
  return new Promise(
    function(resolve, reject){
      lfm.artist.getInfo(
        {artist: artist},
        function(err, data){
          if(err){
            reject(err);
          }
          delete data.similar;
          resolve(data);
        });
    }
  );
}

exports.index = function(req, res) {
  asyncGetTopTracks()
  .then((tracks)=>{
    res.json(tracks);
  })
  .catch((err)=>{
    log.error("On API /music, ERROR: %s",err);
    res.status(404).send(error);
  });
};

exports.search = function(req, res) {
  var query = req.params.query;
  asyncSearchForTracks(query)
  .then((tracks)=>{
    res.json(tracks);
  })
  .catch((err)=>{
    log.error("On API /music, ERROR: %s",err);
    res.status(404).send(error);
  });
};

exports.track = function(req, res){
  var artist = req.params.artist;
  var track = req.params.track;
  getTrack(artist, track)
  .then((track)=>{
    getArtist(artist)
    .then(
      (artist)=>{
        track.artist = artist;
        res.json(track);
      }
    )
    .catch(
      (err)=>{throw "Error on Artist, ERROR"+err;
    });
  })
  .catch((err)=>{
    log.error("On API /music/:artist/tracks/:track, ARTIST:%s, TRACK:%s, ERROR:%s",
      artist,track,err);
    res.status(404).send({error:err,artist:artist,track:track});
  })
  ;
};

exports.artist = function(req, res){
  var artist = req.params.artist;
  getArtist(artist)
  .then((artist)=>{
    res.json(artist);
  })
  .catch((err)=>{
    log.error("On API /music/:artist, ARTIST:%s, ERROR:%s",
      artist,err);
    res.status(404).send({error:err,track:track});
  })
  ;
}