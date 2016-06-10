
var Recommendation  = require("../recommender/recommendation.model");
var Promise = require("bluebird");
var request = require("request");

var getRecommendations = function (username) {
  return new Promise(
    function (resolve, reject) {
    	/*Recommendation.find().exec((err, users)=>{
    		resolve(users);
    	});*/
      Recommendation.findOne({username:username},
        function (err, res) {
          if(err){
            reject(err);
          }else{
            resolve(res);
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