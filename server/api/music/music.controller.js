'use strict';

var _ = require('lodash');
var Promise = require("bluebird");
var request = require("request");
var Log = require('log'), log = new Log('info');
var lastfmapi = require('lastfmapi');
var lfm = new lastfmapi({
  'api_key': process.env.LASTFM_ID,
  'api_secret': process.env.LASTFM_SECRET
});
var Track = require("./track.model");
var Artist = require("./artist.model");

/**
 * Get top tracks from Last.fm API in Async form
 * @return {Promise<Object,Error>}
 */
function asyncGetTopTracks() {
  return new Promise(function (resolve, reject) {
    lfm.geo.getTopTracks(
      {
        'country': 'Colombia',
        'limit': 20
      },
      function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(data.track);
      }
    );
  });
}

/**
 * Get tracks that match with a query
 * @param {String} query - Song name
 * @return {Promise<Object,Error>}
 */
function asyncSearchForTracks(query) {
  return new Promise(function (resolve, reject) {
    lfm.track.search(
      {
        'track': query,
        'limit': 10
      },
      function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(data.trackmatches.track);
      }
    );
  });
}

/**
 * Get Track from Last.fm API
 * @param {String} artist - Artist name
 * @param {String} track - Track title
 * @return {Promise<Object,Error>} - Track data
 */
function getTrack(artist, track) {
  return new Promise(
    function (resolve, reject) {
      lfm.track.getInfo(
        {track: track, artist: artist},
        function (err, data) {
          if (err) {
            const error = new Error();
            error.message = "Error on get Trakt";
            error.stack = err.stack;
            reject(error);
          }
          resolve(data);
        });
    }
  );
}

/**
 * Get Artist from Last.fm API
 * @param {String} artist - Artist name
 * @return {Promise<Object,Error>} - Artist data
 */
function getArtist(artist) {
  return new Promise(
    function (resolve, reject) {
      lfm.artist.getInfo(
        {artist: artist},
        function (err, data) {
          if (err) {
            reject(err);
          }
          /*try {
           delete data.similar;
           } catch (err) {
           log.error(err);
           }*/
          resolve(data);
        }
      );
    }
  );
}

/**
 * Add Artist to the DB
 * @param {Object} apiArtist - Last.fm API Object
 * @return {Promise<Artist,Error>} -
 */
function addArtistToDB(apiArtist) {
  return new Promise(
    function (resolve, reject) {
      let newArtist = new Artist({
        slug: apiArtist.name,
        mbid: apiArtist.mbid ? apiArtist.mbid : null
      });
      newArtist.save((err, artist)=> {
        if (err) {
          log.error(err);
          reject(err);
        }else {
          log.info("Artist %s have been added to the DB", artist.slug);
          resolve(artist);
        }
      });
      resolve(newArtist);
    }
  );
}

/**
 * Add Track to the DB
 * @param {Object} apiTrack - Last.fm Track Object
 * @param {Artist} dbArtist - Artist stored in DB
 * @return {Promise<Track,Error>}
 */

function addTrackToDB(apiTrack, dbArtist) {
  return new Promise(
    function (resolve, reject) {
      let newTrack = new Track({
        slug: {artist: apiTrack.artist.name, track: apiTrack.name},
        artist: dbArtist
      });
      newTrack.save((err, track)=> {
        if (err) {
          log.error(err);
          reject(err);
        }else {
          log.info("Track %s of %s have been added to the DB", track.slug.artist, track.slug.track);
          resolve(track);
        }
      });
      resolve(newTrack);
    }
  );
}

/**
 * Method to get an Artist and make it if it hadn't made it before.
 * @param {Object} apiArtist - Artist object returned from Last.fm API
 * @return {Promise<Artist,Error>}
 */
function checkArtist(apiArtist) {
  return new Promise(
    function (resolve, reject) {
      Artist.findOne({slug: apiArtist.name},
        function (err, artist) {
          if (err) {
            addArtistToDB(apiArtist)
              .then(
                (artist)=> {
                  resolve(artist);
                }
              )
              .catch(
                (err)=> {
                  reject(err);
                }
              );
          } else {
            if (artist == null) {
              addArtistToDB(apiArtist)
                .then(
                  (artist)=> {
                    resolve(artist);
                  }
                ).catch(
                (err)=> {
                  reject(err);
                }
              );
            } else {
              log.info("Artist %s already exists",artist.slug);
              resolve(artist);
            }
          }
        }
      );
    }
  );
}

/**
 * Method to get a Track and make it if it hadn't made it before.
 * @param {Object} apiTrack - Track object returned from Last.fm API
 * @param {String} artistName - Artist name to pass to {@link getArtist}
 * @return {Promise<Track,Error>}
 */
function checkTrack(apiTrack, artistName) {
  return new Promise(
    function (resolve, reject) {
      getArtist(artistName)
        .then((apiArtist)=> {
            checkArtist(apiArtist)
              .then((dbArtist)=> {
                  Track.findOne(
                    {
                      slug: {
                        artist: dbArtist.slug,
                        track: apiTrack.name
                      }
                    },
                    function (err, track) {
                      if (err) {
                        addTrackToDB(apiTrack, dbArtist)
                          .then(
                            (track)=> {
                              resolve(track);
                            }
                          ).catch((err)=> {
                            reject(err)
                          }
                        );
                      } else {
                        if (track == null) {
                          addTrackToDB(apiTrack, dbArtist)
                            .then(
                              (track)=> {
                                resolve(track);
                              }
                            ).catch((err)=> {
                              reject(err)
                            }
                          );
                        } else {
                          log.info("Track %s of %s already exists",track.slug.track,track.slug.artist);
                          resolve(track);
                        }
                      }
                    }
                  );
                  return null; // To Avoid warning
                }
              );
            return null; // To Avoid warning
          }
        ).catch((err)=> {
        reject(err)
      });
    }
  );
}


exports.index = function (req, res) {
  asyncGetTopTracks()
    .then((tracks)=> {
      res.json(tracks);
    })
    .catch((err)=> {
      log.error("On API /music, ERROR: %s", err);
      res.status(404).send(error);
    });
};

exports.search = function (req, res) {
  var query = req.params.query;
  asyncSearchForTracks(query)
    .then((tracks)=> {
      res.json(tracks);
    })
    .catch((err)=> {
      log.error("On API /music, ERROR: %s", err);
      res.status(404).send(error);
    });
};

exports.artist = function (req, res) {
  var query = req.params.artist;
  getArtist(query)
    .then((apiArtist)=> {
      checkArtist(apiArtist)
        .then(
          (data)=> {
            res.json(apiArtist);
          }
        );
      return null; //To Avoid Warning
    })
    .catch((err)=> {
      log.error("On API /music/:artist, ARTIST:%s, ERROR:%s",
        artist, err);
      res.status(404).send({error: err, track: query});
    })
  ;
};

exports.track = function (req, res) {
  var queryArtist = req.params.artist;
  var queryTrack = req.params.track;
  getTrack(queryArtist, queryTrack)
    .then((track)=> {
      getArtist(queryArtist)
        .then((artist)=> {
            track.artist = artist;
            checkTrack(track,queryArtist)
              .then((data)=>{
                res.json(track);
                return null;
              })
            ;
            return null; //To Avoid Warning
          }
        );
      return null;//To Avoid Warning
    })
    .catch((err)=> {
      log.error("On API /music/:artist/tracks/:track," +
        "ARTIST:%s, TRACK:%s, ERROR:%s",
        queryArtist, queryTrack, err);
      res.status(404).send({
        error: err,
        artist: queryArtist, track: queryTrack
      });
      return null;//To Avoid Warning
    })
  ;
};


