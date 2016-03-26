'use strict';

module.exports = function(app){
	app.controller('MusicCtrl', function($scope, $http, socket){
		$scope.music = [];
		$scope.waiting = true;
		$http.get("/api/music").then(
			function(data){
				$scope.music = data.data;
				$scope.waiting = false;
			},
			function(err){
				console.log(err);
				$scope.waiting = false;
			}
		);
	});
}