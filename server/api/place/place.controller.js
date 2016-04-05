'use strict';

var _  = require('lodash');
var Log = require('log'), log = new Log('info');
var request = require("request");
var rp = require("request-promise");
var Promise = require("bluebird");

function getFirstPlaceImage(placeid){
  return new Promise(
    (resolve,reject)=>{
      var requesturi = "https://api.foursquare.com/v2/venues/"+placeid+"/photos"+
        "?client_id="+process.env.FOURSQUARE_ID+
        "&client_secret="+process.env.FOURSQUARE_SECRET+
        "&v=20130815"+
        "&limit=1"
      request.get(
        requesturi,
        (err, res, body) =>{
            if(err){
              reject(err);
            }
            try{
              var photo = JSON.parse(body).response.photos.items[0];
            }catch(e){
              reject(e);
            }
            resolve(photo);
          }
        )
    }
  );
}

function searchPlace(query){
  return new Promise(
    (resolve,reject)=>{
      var requesturi = "https://api.foursquare.com/v2/venues/search"+
        "?client_id="+process.env.FOURSQUARE_ID+
        "&client_secret="+process.env.FOURSQUARE_SECRET+
        "&v=20130815"+
        "&ll=6.244747,-75.574828"
        "&query="+query;
      request.get(
        requesturi,
        (err, res, body) => {
          if(err){
            reject(err);
          }
          var places = body;
          resolve(places);
        }
        )
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
    res.json(places);
  }).catch((error) => {
    log.error("On API /books, ERROR: %s",error);
    res.send(error);
  });
};
