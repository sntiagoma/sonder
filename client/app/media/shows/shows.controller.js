'use strict';

module.exports = function(app){
	app.controller('ShowsCtrl', function($scope, $http, socket){
		$scope.shows = [];
		$scope.waiting = true;
		$http.get("/api/shows").then(
			function(data){
				$scope.shows = data.data;
				$scope.waiting = false;
			},
			function(err){
				console.log(err);
				$scope.waiting = false;
			}
		);
	});
}