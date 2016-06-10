
var Recommendation  = require("../recommender/recommendation.model");
var Promise = require("bluebird");
var request = require("request");
var Trakt = require("trakt-api"), trakt = Trakt(process.env.TRAKT_ID);
var lastfmapi = require('lastfmapi');
var lfm = new lastfmapi({
  'api_key': process.env.LASTFM_ID,
  'api_secret': process.env.LASTFM_SECRET
});

function getBookByOLID (olid){
  return new Promise(
    (resolve, reject) => {
      request.get(
        {
          url: "https://openlibrary.org/api/books",
          qs: {
            bibkeys: "OLID:"+olid,
            format: "json",
            jscmd: "data"
          },
          json: true
        },
        (err, res, book) => {
          if(err){
            reject(err);
          }
          resolve(book["OLID:"+olid]);
        }
      );
    }
  );
}

function getVenueInfo(venueid){
  return new Promise(
    (resolve, reject) => {
      request.get(
        {
          url: "https://api.foursquare.com/v2/venues/"+venueid,
          qs: {
            client_id: process.env.FOURSQUARE_ID,
            client_secret: process.env.FOURSQUARE_SECRET,
            v: "20130815"
          },
          json: true
        },
        (err, res, venue) => {
          if(err){
            reject(err);
          }
          resolve(venue.response.venue);
        }
      );
    }
  );
}

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

var getRecommendations = function (username) {
  return new Promise(
    function (resolve, reject) {
      var promises = [];
      Recommendation.findOne({username:username})
      .populate('music_recom movies_recom places_recom shows_recom books_recom')
      .exec( 
        function (err, res) {
          if(!res){
            reject(err);
          }else{
            res.shows_recom = res.shows_recom.slice(0, 4);
            res.music_recom = res.music_recom.slice(0, 4);
            res.places_recom = res.places_recom.slice(0, 4);
            res.books_recom = res.books_recom.slice(0, 4);
            res.movies_recom = res.movies_recom.slice(0, 4);
            for (var i = res.shows_recom.length - 1; i >= 0; i--) {
              var pm = trakt.show(res.shows_recom[i].slug, {extended:"full,images"});
              promises.push(pm);
            }
            Promise.all(promises).then((shows)=>{
              for (var i = shows.length - 1; i >= 0; i--) {
                res.shows_recom[i] = shows[i];
              }
              promises = [];
              for (var i = res.movies_recom.length - 1; i >= 0; i--) {
                var pm = trakt.movie(res.movies_recom[i].slug, {extended:"full,images"});
                promises.push(pm);
              }
              Promise.all(promises).then((movies)=>{
                for (var i = movies.length - 1; i >= 0; i--) {
                  res.movies_recom[i] = movies[i];
                }
                promises = [];
                for (var i = res.books_recom.length - 1; i >= 0; i--) {
                  var pm = getBookByOLID(res.books_recom[i].slug);
                  promises.push(pm);
                }
                Promise.all(promises).then((books)=>{
                  for (var i = books.length - 1; i >= 0; i--) {
                    res.books_recom[i] = books[i];
                  }
                  promises = [];
                  for (var i = res.music_recom.length - 1; i >= 0; i--) {
                    var pm = getTrack(res.music_recom[i].slug.artist, res.music_recom[i].slug.track);
                    promises.push(pm);
                  }
                  Promise.all(promises).then((music)=>{
                    for (var i = music.length - 1; i >= 0; i--) {
                      res.music_recom[i] = music[i];
                    }
                    promises = [];
                    for (var i = res.places_recom.length - 1; i >= 0; i--) {
                      var pm = getVenueInfo(res.places_recom[i].slug);
                      promises.push(pm);
                    }
                    Promise.all(promises).then((places)=>{
                      for (var i = places.length - 1; i >= 0; i--) {
                        res.places_recom[i] = places[i];
                      }
                      resolve(res);
                    });
                  });
                });
              });
            });
          }
        }
      );
    }
  );
};


exports.index = function(req, res){
	var username = req.params.username;
	getRecommendations(username)
	.then(function(result){
		res.json(result);
	})
}