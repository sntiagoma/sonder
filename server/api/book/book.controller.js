'use strict';

var _  = require('lodash');
var Promise = require("bluebird");
var request = require("request");
var Log = require('log'), log = new Log('info');

var subjects = [
  "fiction",
  "mystery",
  "thriller",
  "historical_fiction",
  "fantasy",
  "romance",
  "science_fiction",
  "horror",
  "humor",
  "nonfiction",
  "biography_&_autobiography",
  "autobiography",
  "history",
  "science",
  "technology",
  "food-coo",
  "graphic_novels",
  "poetry",
  "children",
  "motion_pictures",
  "drama"
];

function getSubject (subject){
  return new Promise(
    (resolve, reject) => {
      request.get(`http://openlibrary.org/subjects/${subject}.json?limit=2`,
        (err, res, body) => {
          if(err){
            reject(err);
          }
          var works = JSON.parse(body).works;
          resolve(works);
        }
      );
    }
  );
}

function searchForTitle (query){
  return new Promise(
    (resolve, reject) => {
      request.get(`http://openlibrary.org/search.json?q=`+query,
        (err, res, body) => {
          if(err){
            reject(err);
          }
          var books = JSON.parse(body).docs;
          resolve(books);
        }
      );
    }
  );
}

exports.index = function(req, res) {
  Promise.map(
    subjects,
    (sub)=>{
      return getSubject(sub);
    }
  ).then((datos)=>{
    res.json(_.flatten(datos));
  }).catch((error) => {
    log.error("On API /books, ERROR: %s",error);
    res.send(error);
  });
};

exports.search = function(req, res) {
  var query = req.params.query;
  searchForTitle(query)
  .then((books)=>{
    res.json(books);
  }).catch((error) => {
    log.error("On API /books, ERROR: %s",error);
    res.send(error);
  });


};
