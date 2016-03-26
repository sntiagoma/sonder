'use strict';

var _  = require('lodash');
var Log = require('log'), log = new Log('info');
var rp = require("request-promise");

exports.index = function(req, res) {
  var loc = req.query.loc;
  if(typeof loc == "undefined"){
    loc = "6.244747,-75.574828";
  }
  var options = {
    uri:"https://api.foursquare.com/v2/venues/explore",
    qs : {
      client_id: process.env.FOURSQUARE_ID,
      client_secret: process.env.FOURSQUARE_SECRET,
      v:"20130815",
      ll:loc,
      query:""
    },
    json:true
  };
  rp(options)
    .then(function (data) {
      res.send(data.response.groups[0].items);
    })
    .catch(function (err) {
      res.status(404).send(err);
    });
};