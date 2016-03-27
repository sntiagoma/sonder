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


exports.index = function(req, res) {
  asyncGetTopTracks()
  .then((tracks)=>{
    res.json(tracks);
  })
  .catch((err)=>{
    log.error("On API /music, ERROR: %s",err);
    res.send(error);
  });
};