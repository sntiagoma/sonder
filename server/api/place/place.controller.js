'use strict';

var _  = require('lodash');
var Log = require('log'), log = new Log('info');
var request = require("request");
var rp = require("request-promise");
var Promise = require("bluebird");
var Place = require("./place.model");

/**
 * Get first image of a place, used to show on search
 * @param {String} placeid - Venue Id of a Foursquare place
 * @return {Promise<String,Error>}
 */
function getFirstPlaceImage(placeid){
  return new Promise(
    (resolve,reject)=>{
      request.get(
        {
          url: "https://api.foursquare.com/v2/venues/"+placeid+"/photos",
          qs: {
            client_id: process.env.FOURSQUARE_ID,
            client_secret: process.env.FOURSQUARE_SECRET,
            v: "20130815",
            limit: 1
          },
          json: true
        },
        (err, res, body) =>
          {
            if(err){
              reject(err);
            }
            var photo = body.response.photos.items[0];
            resolve(photo);
          }
        )
    }
  );
}

/**
 * Search places on Foursuare API
 * @param {String} query - Query word to find the place
 * @return {Promise<Object,Error>}
 */
function searchPlace(query){
  return new Promise(
    (resolve,reject)=>{
      request.get(
        {
          url: "https://api.foursquare.com/v2/venues/search",
          qs: {
            client_id: process.env.FOURSQUARE_ID,
            client_secret: process.env.FOURSQUARE_SECRET,
            v: "20130815",
            ll: "6.244747,-75.574828",
            query: query,
            limit: 10
          },
          json: true
        },
        (err, res, body) =>
          {
            if(err){
              reject(err);
            }
            try{
              resolve(body.response.venues);
            }catch(e){
              reject(e);
            }
          }
        )
    }
  );
}

/**
 * Get a Venue from Foursquare API
 * @param {String} venueid - Venue Id of a Foursquare Place
 * @return {Promise<Object,Error>}
 */
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

/**
 * Add Place to the DB
 * @param {Object} apiPlace - Foursquare API Object {@link getVenueInfo}
 * @return {Promise<Place,Error>} -
 */
function addPlaceToDB(apiPlace) {
  return new Promise(
    function (resolve, reject) {
      let newPlace = new Place({
        slug: apiPlace.id,
        name: apiPlace.name
      });
      newPlace.save((err, place)=> {
        if (err) {
          log.error(err);
          reject(err);
        }else {
          log.info("Place %s have been added to the DB", place.name);
          resolve(place);
        }
      });
      resolve(newPlace);
    }
  );
}

/**
 * Method to get an Place and make it if it hadn't made it before.
 * @param {Object} apiPlace - Place object returned from Foursquare API
 * @return {Promise<Place,Error>}
 */
function checkPlace(apiPlace) {
  return new Promise(
    function (resolve, reject) {
      Place.findOne({slug: apiPlace.id},
        function (err, place) {
          if (err) {
            addPlaceToDB(apiPlace)
              .then(
                (place)=> {
                  resolve(place);
                  return null;
                }
              )
              .catch(
                (err)=> {
                  reject(err);
                }
              );
          } else {
            if (place == null) {
              addPlaceToDB(apiPlace)
                .then(
                  (place)=> {
                    resolve(place);
                    return null;
                  }
                ).catch(
                (err)=> {
                  reject(err);
                }
              );
            } else {
              log.info("Place %s already exists",place.name);
              resolve(place);
            }
          }
        }
      );
    }
  );
}

exports.index = function(req, res) {
  var loc = req.query.loc;
  if(typeof loc == "undefined"){
    loc = "6.244747,-75.574828";
  }
  rp(
    {
      uri:"https://api.foursquare.com/v2/venues/explore",
      qs : {
        client_id: process.env.FOURSQUARE_ID,
        client_secret: process.env.FOURSQUARE_SECRET,
        v:"20130815",
        ll:loc,
        query:""
      },
      json:true
    }
  )
  .then(function (data) {
    var datos = _.map(
      data.response.groups[0].items,
      (item)=>{return item.venue}
    );
    var ids = _.map(datos, (item)=>{return item.id});
    Promise.map(
      ids,
      (id)=>{
        return getFirstPlaceImage(id);
      }
      )
    .then((data)=>{
      for(let i = 0; i<data.length; i++){
        datos[i].image = data[i];
      }
      res.send(datos);
    })
    .catch((error)=>{
      throw error;
    });
  })
  .catch(function (err) {
    log.error(err);
    res.status(404).send(err);
  });
};

exports.search = function(req, res) {
  var query = req.params.query;
  searchPlace(query)
  .then((places)=>{
    var ids = _.map(places, (item)=>{return item.id});
    Promise.map(
      ids,
      (id)=>{
        return getFirstPlaceImage(id);
      }
      )
    .then((data)=>{
      for(let i = 0; i<data.length; i++){
        places[i].image = data[i];
      }
      res.send(places);
    })
    .catch((error)=>{
      throw error;
    });
  });
};

exports.venue = function (req, res) {
  var venueId = req.params.venueid;
  getVenueInfo(venueId)
    .then((apiVenue)=> {
      checkPlace(apiVenue)
        .then((dbPlace)=> {
          res.json(apiVenue);
          return null;
        });
      return null;
    })
    .catch((err)=> {
      log.error(err);
      res.status(404).send(err);
    });
};
