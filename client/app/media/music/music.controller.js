'use strict';

module.exports = function(app){
	app.controller('MusicCtrl', function($scope, $http, socket){
		var lastfmapi = require('lastfmapi');
		/*var lfm = new lastfmapi {
			'api_key': process.env.LASTFM_ID,
			'api_secret': process.env.LASTFM_SECRET
		}*/
		var lfm = new lastfmapi({
			'api_key': 'daf892b5e71b6eb11332fd993874f2b5',
			'api_secret': '19b0ee51f9ac7a5a71b73e03ec0f2f1d'
		});
		$scope.music = [];
		$scope.waiting = true;
		lfm.geo.getTopTracks({
			'country': 'Colombia',
			'limit': 10
		}, function(err, data){
			if(err){
				console.log("### PANIC ###");
				return console.log(err);
			}
			$scope.music = data.track;
		});
		$scope.waiting = false;
	});
}