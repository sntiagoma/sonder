'use strict';

var lastfmapi = require('lastfmapi');

/*var lfm = new lastfmapi {
	'api_key': process.env.LASTFM_ID,
	'api_secret': process.env.LASTFM_SECRET
}*/

var lfm = new lastfmapi({
	'api_key': 'daf892b5e71b6eb11332fd993874f2b5',
	'api_secret': '19b0ee51f9ac7a5a71b73e03ec0f2f1d'
});

var params = {
	'country': 'Colombia',
	'limit': 10
}

function handleData(err, data){
	if(err){
		console.log("### PANIC ###");
		return console.log(err);
	}
	/*console.log("Successfully fetched top tracks in Colombia");
	console.log(data);
	console.log(data.track[0].image[1]["#text"]);
	console.log(data.track[0].artist);*/
	$scope.music = data.track;
}
//un-comment in DEV
//lfm.geo.getTopTracks(params, handleData);


module.exports = function(app){
	app.controller('MusicCtrl', function($scope, $http, socket){
		$scope.music = [];
		$scope.waiting = true;
		lfm.geo.getTopTracks(params, handleData);
		$scope.waiting = false;
	});
}